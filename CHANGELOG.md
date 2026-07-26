# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 0.0.1

- Initial release. A Language Server Protocol server that wraps
  [xslint](https://github.com/maxonfjvipon/xslint): live diagnostics as you
  type over the editor buffer, quick-fixes for the fixable checks, and a
  fix-all action — all reusing xslint's own `lint` and `fixed` engine, so an
  editor fix is identical to a command-line `--fix`. Ships with a VS Code
  extension client, and works in any LSP-capable editor.
