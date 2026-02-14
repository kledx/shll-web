# SHLL Web

SHLL Web is the frontend for SHLL Protocol (BSC Testnet), including:

- Market and agent detail pages
- Agent Console (Autopilot enable/disable/status flow)
- Me page
- Docs page with onboarding, runtime model, and security model

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- wagmi + RainbowKit (wallet connection)
- viem

## Prerequisites

- Node.js 20+
- pnpm 9+

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

SHLL Web can run standalone, but Autopilot and activity APIs need runner/indexer services.

Create `.env.local` in this repo and configure as needed:

```env
# Backend dependencies
RUNNER_URL=http://127.0.0.1:8787
PONDER_URL=http://127.0.0.1:42069

# Optional API auth (sent as x-api-key to runner routes)
RUNNER_API_KEY=
# Fallback key name supported by API routes
API_KEY=

# Optional UI defaults
NEXT_PUBLIC_RUNNER_OPERATOR=
NEXT_PUBLIC_EXPLORER_TX_BASE_URL=https://testnet.bscscan.com/tx
```

Notes:

- If `RUNNER_URL` / `PONDER_URL` are not reachable, console status and activity endpoints will fail.
- `RUNNER_API_KEY` (or `API_KEY`) is required when your runner protects `/enable`, `/disable`, `/status`.

## Available Scripts

- `pnpm dev`: start local dev server
- `pnpm build`: production build
- `pnpm start`: run production server
- `pnpm lint`: run ESLint
- `pnpm test:unit`: run unit tests in `tests/`

## Docs Page Content Map

The `/docs` page is now structured into four tabs:

- `Quick Start`
- `Runtime`
- `Security`
- `FAQ`

Key edit points:

- Docs page layout/components: `src/app/docs/page.tsx`
- Docs i18n copy (EN/ZH): `src/lib/i18n/dictionaries.ts`
- Security diagrams:
  - `public/docs/security-execution-flow.svg`
  - `public/docs/security-architecture-layers.svg`

## Navigation External Links

Top-right header icons are configured in `src/components/ui/app-shell.tsx`:

- X: `https://x.com/shllrun`
- GitHub: `https://github.com/kledx/shll`

## Integration Notes

- Web API routes proxy to runner/indexer via:
  - `src/app/api/autopilot/*`
  - `src/app/api/activity/route.ts`
  - `src/app/api/indexer/route.ts`
- Full end-to-end testing requires:
  - running `shll-runner`
  - running `shll-indexer`
  - wallet connected on BSC Testnet

## Docker

`docker-compose.yml` contains a production image service (`ghcr.io/kledx/shll-web:latest`) and expects external `shll-indexer` networking.
