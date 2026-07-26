/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

'use strict'

const fs = require('fs')

const version = process.argv[2]
const dependency = process.argv[3]
if (!version || !dependency) {
  throw new Error('usage: changelog-add.js <version> <xslint-version>')
}

const today = new Date().toISOString().slice(0, 10)
const lines = fs.readFileSync('CHANGELOG.md', 'utf-8').split('\n')
const at = lines.indexOf('## Unreleased')
if (at < 0) {
  throw new Error('no "## Unreleased" section in CHANGELOG.md')
}
lines.splice(
  at + 1,
  0,
  '',
  `## ${version} - ${today}`,
  '',
  `- Bump \`@maxonfjvipon/xslint\` to ${dependency}.`,
)
fs.writeFileSync('CHANGELOG.md', lines.join('\n'))
