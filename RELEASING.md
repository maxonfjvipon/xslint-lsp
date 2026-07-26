# Releasing

`xslint-lsp` releases **automatically** whenever `xslint` releases, and can
also be released by hand.

## Automatic (the cascade)

When `xslint` publishes a new version it dispatches `xslint-released` here.
[`.github/workflows/cascade.yml`](.github/workflows/cascade.yml) then bumps
`@maxonfjvipon/xslint` to that version, validates against it (lint, test,
coverage), records the change in `CHANGELOG.md`, and cuts this tool's own next
patch — `npm view xslint-lsp version` + 1, independent of xslint's number —
pushing the tag so `release.yml` publishes to npm. Nothing to do; it happens.

## Manual

First, in `CHANGELOG.md`, rename `## Unreleased` to `## <version> - <date>`.
Then comment on any issue or pull request:

```text
@rultor release, tag=0.0.3
```

The tag triggers [`release.yml`](.github/workflows/release.yml), which stamps
the version, tests, and publishes `xslint-lsp` to npm over OIDC.

## Deferred

The VS Code extension under `client/` is not yet published to the Marketplace
— that hop waits on a `VSCE_PAT` (an Azure DevOps token). The npm package
publishes regardless.

## Prerequisites

- `DISPATCH_TOKEN` — an organization secret (PAT, `repo` + `workflow` scope).
- The `master` ruleset grants the organization admin a bypass, so the
  cascade's bump can push to the protected branch.
