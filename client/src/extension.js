/*
 * SPDX-FileCopyrightText: Copyright (c) 2025-2026 Max Trunnikov
 * SPDX-License-Identifier: MIT
 */

const {LanguageClient, TransportKind} = require('vscode-languageclient/node')

/**
 * The running client, kept so it can be stopped on deactivate.
 * @type {LanguageClient}
 */
let client

/**
 * Launch the xslint language server and connect VS Code to it. The server runs
 * as a child node process over stdio and lints every `.xsl`/`.xslt` file.
 */
const activate = function() {
  const module = require.resolve('xslint-lsp')
  client = new LanguageClient(
    'xslint',
    'xslint',
    {
      run: {module: module, transport: TransportKind.stdio},
      debug: {module: module, transport: TransportKind.stdio},
    },
    {
      documentSelector: [
        {scheme: 'file', language: 'xsl'},
        {scheme: 'file', pattern: '**/*.{xsl,xslt}'},
      ],
    },
  )
  client.start()
}

/**
 * Stop the language server when the extension shuts down.
 * @return {Thenable|undefined} - Resolves once the server has stopped
 */
const deactivate = function() {
  return client ? client.stop() : undefined
}

module.exports = {
  activate,
  deactivate,
}
