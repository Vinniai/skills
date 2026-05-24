# portless

Named local dev-server URLs over trusted HTTPS — e.g. `https://myapp.localhost`
instead of `http://localhost:3000` — with auto-generated certs and no browser
warnings. Pairs well with `agent-emulate --portless`.

- **[portless](./portless/SKILL.md)** — set up and use portless for named local HTTPS URLs.

## Attribution

Third-party skill, vendored from
[`vercel-labs/portless`](https://github.com/vercel-labs/portless)
(`npx skills add vercel-labs/portless`), licensed **Apache 2.0** — see
[`portless/LICENSE`](./portless/LICENSE). The upstream repo also ships an
`oauth` skill, not vendored here. Don't hand-edit; refresh from upstream.
