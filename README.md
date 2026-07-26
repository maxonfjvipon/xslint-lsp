# xslint-lsp

A [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
server that surfaces [xslint](https://github.com/maxonfjvipon/xslint)'s
diagnostics as you type — squiggles in your editor instead of a failed build.

[![DevOps By Rultor.com](https://www.rultor.com/b/maxonfjvipon/xslint-lsp)](https://www.rultor.com/p/maxonfjvipon/xslint-lsp)

[![npm](https://img.shields.io/npm/v/xslint-lsp.svg?style=flat)](https://www.npmjs.com/package/xslint-lsp)
[![test](https://github.com/maxonfjvipon/xslint-lsp/actions/workflows/test.yml/badge.svg)](https://github.com/maxonfjvipon/xslint-lsp/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/maxonfjvipon/xslint-lsp/branch/master/graph/badge.svg)](https://codecov.io/gh/maxonfjvipon/xslint-lsp)
[![PDD status](http://www.0pdd.com/svg?name=maxonfjvipon/xslint-lsp)](http://www.0pdd.com/p?name=maxonfjvipon/xslint-lsp)
[![Hits-of-Code](https://hitsofcode.com/github/maxonfjvipon/xslint-lsp)](https://hitsofcode.com/view/github/maxonfjvipon/xslint-lsp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/maxonfjvipon/xslint-lsp/blob/master/LICENSE.txt)

xslint lints XSL/XSLT stylesheets — malformed XML, invalid XPath, and stylistic
defects — but only in the terminal and CI. This wraps xslint's engine in an LSP
server, so the same defects light up in any LSP-capable editor: VS Code,
Neovim, and JetBrains IDEs (via [LSP4IJ](https://github.com/redhat-developer/lsp4ij)
or their built-in LSP support).

Because it is a thin transport over xslint — it calls xslint's `lint(sources)`
in-process and maps each defect onto an LSP `Diagnostic` — there is no second
rule engine to keep in sync.

## How it works

```text
editor  ──(LSP over stdio)──▶  src/server.js
                                  │  lint(buffer)      → @maxonfjvipon/xslint
                                  │  diagnostics(defects)  → src/diagnostics.js
                                  ▼
editor  ◀──(publishDiagnostics)──  { range, severity, code: rule, message }
```

The server keeps open documents in sync, re-lints on every change (checking the
live buffer, not the saved file), and clears a file's diagnostics when it
closes. Each xslint defect `{name, severity, message, line, pos}` becomes an LSP
diagnostic whose `code` is the rule name and whose `source` is `xslint`.

## Run it

The server speaks LSP over stdio:

```bash
npm install
node src/server.js --stdio
```

Point any LSP client at that command for `.xsl`/`.xslt` files. A VS Code
extension that launches it lives in [`client/`](client).

## Development

```bash
npm test        # unit tests + an end-to-end LSP round-trip
npm run coverage   # the same, under c8 with a 100% gate
npm run lint    # eslint (google + @stylistic)
```

Tests run on Node's built-in runner (`node --test`). `test/diagnostics.test.js`
covers the defect→diagnostic mapping; `test/server.test.js` spawns the server
and drives it through open/change/close, asserting the diagnostics it publishes
— and it exits the server cleanly so its subprocess coverage is captured.

## License

MIT — see [LICENSE.txt](LICENSE.txt).
