/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const test = require('node:test')
const assert = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')
const {spawn} = require('node:child_process')

/**
 * A minimal LSP client over stdio: it spawns the server, frames JSON-RPC
 * messages with their `Content-Length` header, parses the server's framed
 * replies, and hands each `textDocument/publishDiagnostics` to whoever is
 * waiting. Enough to drive the server through a document's lifecycle.
 */
class Client {
  /** Spawn the server and start reading its framed output. */
  constructor() {
    this.server = spawn(
      'node', [path.resolve(__dirname, '..', 'src', 'server.js'), '--stdio'],
      {stdio: ['pipe', 'pipe', 'inherit']},
    )
    this.buffer = Buffer.alloc(0)
    this.waiting = []
    this.responses = new Map()
    this.nextId = 1000
    this.server.stdout.on('data', (chunk) => this.consume(chunk))
  }

  /**
   * Send a JSON-RPC message to the server.
   * @param {object} message - The message, without the `jsonrpc` field
   */
  send(message) {
    const body = JSON.stringify({jsonrpc: '2.0', ...message})
    this.server.stdin.write(
      `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`,
    )
  }

  /**
   * Parse every complete framed message in the buffer, resolving a pending
   * waiter for each diagnostics notification.
   * @param {Buffer} chunk - Bytes read from the server
   */
  consume(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk])
    let boundary = this.buffer.indexOf('\r\n\r\n')
    while (boundary >= 0) {
      const length = Number(
        /Content-Length: (\d+)/.exec(this.buffer.subarray(0, boundary))[1],
      )
      const start = boundary + 4
      if (this.buffer.length < start + length) {
        break
      }
      const message = JSON.parse(
        this.buffer.subarray(start, start + length).toString(),
      )
      this.buffer = this.buffer.subarray(start + length)
      if (message.method === 'textDocument/publishDiagnostics') {
        this.waiting.shift()(message.params.diagnostics)
      } else if (Object.hasOwn(message, 'result') && this.responses.has(message.id)) {
        const resolve = this.responses.get(message.id)
        this.responses.delete(message.id)
        resolve(message.result)
      }
      boundary = this.buffer.indexOf('\r\n\r\n')
    }
  }

  /**
   * A promise for the next diagnostics notification.
   * @return {Promise.<Array.<object>>} - The published diagnostics
   */
  diagnostics() {
    return new Promise((resolve) => this.waiting.push(resolve))
  }

  /**
   * Send a request and resolve with its result.
   * @param {string} method - The request method
   * @param {object} params - The request params
   * @return {Promise.<*>} - The result
   */
  request(method, params) {
    this.nextId += 1
    const id = this.nextId
    return new Promise((resolve) => {
      this.responses.set(id, resolve)
      this.send({id: id, method: method, params: params})
    })
  }

  /**
   * Ask the server to shut down and exit cleanly, resolving once its process
   * has gone. A graceful exit lets coverage flush, unlike a kill.
   * @return {Promise.<void>} - Resolves when the server process exits
   */
  close() {
    this.send({id: 2, method: 'shutdown'})
    this.send({method: 'exit'})
    return new Promise((resolve) => this.server.on('exit', () => resolve()))
  }
}

/**
 * A committed fixture stylesheet, as text.
 * @param {string} name - Fixture file name under test/fixtures
 * @return {string} - Its content
 */
const fixture = function(name) {
  return fs.readFileSync(path.resolve(__dirname, 'fixtures', name), 'utf-8')
}

test('reports, updates, and clears diagnostics over a document lifecycle',
  async function() {
    const client = new Client()
    client.send({id: 1, method: 'initialize',
      params: {processId: process.pid, rootUri: null, capabilities: {}}})
    client.send({method: 'initialized', params: {}})
    const opened = client.diagnostics()
    client.send({method: 'textDocument/didOpen', params: {textDocument: {
      uri: 'file:///t.xsl', languageId: 'xml', version: 1,
      text: fixture('violations.xsl')}}})
    const first = await opened
    const changed = client.diagnostics()
    client.send({method: 'textDocument/didChange', params: {
      textDocument: {uri: 'file:///t.xsl', version: 2},
      contentChanges: [{text: fixture('updated.xsl')}]}})
    const second = await changed
    const closed = client.diagnostics()
    client.send({method: 'textDocument/didClose',
      params: {textDocument: {uri: 'file:///t.xsl'}}})
    const third = await closed
    await client.close()
    assert.deepEqual(
      [
        first.some((one) => one.code === 'starts-with-double-slash'),
        second.some((one) => one.code === 'starts-with-double-slash'),
        third.length,
      ],
      [true, false, 0],
    )
  })

test('answers a code-action request, and offers none for an unknown document',
  async function() {
    const client = new Client()
    client.send({id: 1, method: 'initialize',
      params: {processId: process.pid, rootUri: null, capabilities: {}}})
    client.send({method: 'initialized', params: {}})
    const opened = client.diagnostics()
    client.send({method: 'textDocument/didOpen', params: {textDocument: {
      uri: 'file:///t.xsl', languageId: 'xsl', version: 1,
      text: fixture('fixable.xsl')}}})
    await opened
    const some = await client.request('textDocument/codeAction', {
      textDocument: {uri: 'file:///t.xsl'},
      range: {start: {line: 0, character: 0}, end: {line: 20, character: 0}},
      context: {diagnostics: []}})
    const none = await client.request('textDocument/codeAction', {
      textDocument: {uri: 'file:///gone.xsl'},
      range: {start: {line: 0, character: 0}, end: {line: 0, character: 0}},
      context: {diagnostics: []}})
    await client.close()
    assert.deepEqual(
      [some.some((one) => one.kind === 'source.fixAll'), none],
      [true, []],
    )
  })
