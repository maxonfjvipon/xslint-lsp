# xslint for VS Code

Lint your XSL/XSLT stylesheets as you type — malformed XML, invalid XPath, and
stylistic defects — with quick-fixes, powered by
[xslint](https://github.com/xslint/xslint).

## Features

- **Live diagnostics** — every xslint check runs over the buffer as you edit,
  surfacing problems with their exact line and column, no save or build needed.
- **Quick-fixes** — a lightbulb on each fixable defect, plus a *fix all* action
  for the safe fixes. The edits come from xslint's own engine, so a fix in the
  editor is identical to a command-line `xslint --fix`.
- **Any `.xsl`/`.xslt` file** — activates automatically.

## How it works

The extension bundles and launches the
[xslint-lsp](https://www.npmjs.com/package/xslint-lsp) language server, which
wraps xslint and speaks the Language Server Protocol. Because the same server
is editor-agnostic, xslint diagnostics are available in any LSP-capable editor.

## License

MIT
