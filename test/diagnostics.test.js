/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const test = require('node:test')
const assert = require('node:assert')
const {diagnostics} = require('../src/diagnostics')

test('shifts a one-based defect to a zero-based range', function() {
  assert.deepEqual(
    diagnostics([{name: 'short-names', severity: 'warning', message: 'x',
      line: 4, pos: 5}])[0].range,
    {start: {line: 3, character: 4}, end: {line: 3, character: 5}},
  )
})

test('maps an error severity to the LSP error level', function() {
  assert.equal(
    diagnostics([{name: 'x', severity: 'error', message: 'm',
      line: 1, pos: 1}])[0].severity,
    1,
  )
})

test('carries the rule name as the diagnostic code', function() {
  assert.equal(
    diagnostics([{name: 'not-using-output', severity: 'error', message: 'm',
      line: 1, pos: 1}])[0].code,
    'not-using-output',
  )
})

test('names xslint as the diagnostic source', function() {
  assert.equal(
    diagnostics([{name: 'x', severity: 'warning', message: 'm',
      line: 1, pos: 1}])[0].source,
    'xslint',
  )
})

test('defaults an unrecognized severity to warning', function() {
  assert.equal(
    diagnostics([{name: 'x', severity: 'info', message: 'm',
      line: 1, pos: 1}])[0].severity,
    2,
  )
})

test('cannot produce a negative range for a defect at the origin', function() {
  assert.deepEqual(
    diagnostics([{name: 'x', severity: 'warning', message: 'm',
      line: 0, pos: 0}])[0].range.start,
    {line: 0, character: 0},
  )
})
