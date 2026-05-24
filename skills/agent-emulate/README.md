# agent-emulate

Local, stateful drop-in API emulators (`npx agent-emulate`) for CI and
no-network sandboxes — real OAuth/OIDC flows, not mocks. The `emulate` skill is
the entry point; the rest are per-service skills with SDK-specific override
details.

Synced from the sibling repo `../agent-emulate/skills/`.

- **[emulate](./emulate/SKILL.md)** — entry point: start services, CLI, config, seed data, programmatic API, persistence.
- **[vercel](./vercel/SKILL.md)** — emulated Vercel REST API.
- **[github](./github/SKILL.md)** — emulated GitHub REST API.
- **[google](./google/SKILL.md)** — emulated Google OAuth 2.0 / OIDC, Gmail, Calendar, Drive.
- **[slack](./slack/SKILL.md)** — emulated Slack Web API, OAuth, webhooks.
- **[apple](./apple/SKILL.md)** — emulated Sign in with Apple / Apple OIDC.
- **[microsoft](./microsoft/SKILL.md)** — emulated Microsoft Entra ID (Azure AD) OAuth 2.0 / OIDC.
- **[aws](./aws/SKILL.md)** — emulated AWS S3, SQS, IAM, STS.
- **[stripe](./stripe/SKILL.md)** — emulated Stripe API (payments, checkout, customers).
- **[resend](./resend/SKILL.md)** — emulated Resend transactional email API.
- **[next](./next/SKILL.md)** — embed emulators in a Next.js app via `@emulators/adapter-next`.
