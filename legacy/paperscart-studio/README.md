# PapersCart Studio — imported source

The freelancer paperwork studio, lifted out of `paperscart.com` so that app
could become a manifestation community only. Invoices, agreements, timelines,
scopes, lead sheets, QR cards and shipping labels, with PDF export, document
history, saved business profiles and AI drafting.

## This does not run yet

It is source, not a working feature. It was written for a different stack:

| | paperscart | cooper_file |
|---|---|---|
| Framework | React 18 + Vite | Next.js (App Router) |
| Language | plain JSX | TypeScript |
| Backend | Express (`server/routes/*.js`) | Next route handlers |
| Routing | react-router | file-system routing |

So this is a port, not a merge. Nothing here is imported by the app, and
nothing in `app/`, `components/` or `lib/` has been touched — the folder is
inert until someone wires it up.

## What is here

- `src/App.jsx` — the studio itself (~3,000 lines): document type switching,
  forms, live previews, PDF export.
- `src/components/*Form.jsx` / `*Preview.jsx` — one pair per document type.
- `src/utils/` — invoice maths, PDF themes, draft storage, document history,
  business profile, invoice numbering.
- `server/routes/` — the three Express routes only the studio called:
  `history` (saved documents), `email` (sending them), `paperwork` (AI
  drafting).
- `guides/` — the static marketing pages for the invoicing product.
- Shared pieces it cannot run without: `authClient`, `apiConfig`, the auth
  screen and context, `BrandLogo`, Tailwind config, and the original
  `package.json` for its dependency list.

## Porting notes

- **Auth and data are separate.** These files talk to paperscart's Express API
  and its Neon database. Nothing here will authenticate against cooper_file
  without being repointed, and no invoice history or saved business profile
  comes across.
- `html2pdf.js` and `html2canvas` are browser-only — they need a dynamic import
  and a client component under the App Router.
- `src/utils/authClient.js` reads `VITE_*` env vars; those become
  `NEXT_PUBLIC_*`.
- The three Express routes are thin; each maps to one route handler.
