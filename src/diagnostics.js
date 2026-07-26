/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

/**
 * LSP DiagnosticSeverity values keyed by xslint's severity. The protocol's
 * numbers are stable (Error is 1, Warning is 2), so they are inlined to keep
 * this module free of the language-server dependency and trivially testable.
 * @type {{[severity: string]: number}}
 */
const SEVERITY = {
  error: 1,
  warning: 2,
}

/**
 * Map xslint defects onto LSP diagnostics. xslint reports one-based line and
 * column; LSP ranges are zero-based, so each is shifted by one, and the range
 * spans a single character at the defect so the squiggle is visible. The rule
 * name rides along as the diagnostic code, and `xslint` as the source, so the
 * editor shows which check fired.
 * @param {Array.<{name: string, severity: string, message: string,
 *  line: number, pos: number}>} defects - Defects from xslint's `lint`
 * @return {Array.<object>} - LSP Diagnostic objects
 */
const diagnostics = function(defects) {
  return defects.map((defect) => {
    const line = Math.max(defect.line - 1, 0)
    const character = Math.max(defect.pos - 1, 0)
    return {
      range: {
        start: {line: line, character: character},
        end: {line: line, character: character + 1},
      },
      severity: SEVERITY[defect.severity] || SEVERITY.warning,
      code: defect.name,
      source: 'xslint',
      message: defect.message,
    }
  })
}

module.exports = {
  diagnostics,
}
