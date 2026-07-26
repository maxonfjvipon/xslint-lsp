/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

'use strict'

const fs = require('fs')

const version = process.argv[2]
if (!version) {
  throw new Error('usage: changelog-notes.js <version>')
}

const lines = fs.readFileSync('CHANGELOG.md', 'utf-8').split('\n')
const start = lines.findIndex(
  (line) => line === `## ${version}` || line.startsWith(`## ${version} `),
)
if (start < 0) {
  throw new Error(`no "## ${version}" section in CHANGELOG.md`)
}
const next = lines.findIndex(
  (line, index) => index > start && line.startsWith('## '),
)
const stop = next < 0 ? lines.length : next
const notes = lines.slice(start + 1, stop).join('\n').trim()
if (notes === '') {
  throw new Error(`the "## ${version}" section is empty`)
}

process.stdout.write(`${notes}\n`)
