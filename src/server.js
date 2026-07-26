#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const {
  createConnection, TextDocuments, TextDocumentSyncKind, ProposedFeatures,
} = require('vscode-languageserver/node')
const {TextDocument} = require('vscode-languageserver-textdocument')
const {lint} = require('@maxonfjvipon/xslint')
const {diagnostics} = require('./diagnostics')

/**
 * The connection to the editor, over whatever transport the client chose
 * (stdio, a node IPC channel, a socket).
 */
const connection = createConnection(ProposedFeatures.all)

/**
 * The open documents, kept in sync with the editor's buffers.
 */
const documents = new TextDocuments(TextDocument)

/**
 * Lint one document and push its diagnostics to the editor. The buffer's text
 * goes to xslint's `lint` as an in-memory source, so unsaved edits are checked.
 * @param {TextDocument} document - The document to lint
 */
const check = function(document) {
  connection.sendDiagnostics({
    uri: document.uri,
    diagnostics: diagnostics(
      lint([{file: document.uri, content: document.getText()}]),
    ),
  })
}

/**
 * Announce what the server supports: full-document text sync is enough, since
 * every check re-reads the whole buffer anyway.
 * @return {object} - The initialize result
 */
const initialize = function() {
  return {capabilities: {textDocumentSync: TextDocumentSyncKind.Full}}
}

/**
 * Re-lint a document whenever it opens or changes.
 * @param {{document: TextDocument}} event - The change event
 */
const changed = function(event) {
  check(event.document)
}

/**
 * Clear a document's diagnostics when it closes, so stale squiggles do not
 * linger on a file that is no longer open.
 * @param {{document: TextDocument}} event - The close event
 */
const closed = function(event) {
  connection.sendDiagnostics({uri: event.document.uri, diagnostics: []})
}

connection.onInitialize(initialize)
documents.onDidChangeContent(changed)
documents.onDidClose(closed)
documents.listen(connection)
connection.listen()
