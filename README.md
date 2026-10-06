# AADRIT — Portfolio

Personal portfolio for **Aadrit** ([github.com/Aadrit1234](https://github.com/Aadrit1234)) — Full-Stack Developer, Cybersecurity & Ethical Hacking enthusiast, AI/ML explorer.

A dark/light, sci-fi-styled SPA with a boot-sequence preloader, expanding side rail, parallax hero, skill marquee, tabbed about section, project catalog with 3D-tilt cards, an interactive hacker terminal, and a contact terminal that routes straight to the inbox.

## Stack

| Layer | Tech |
| --- | --- |
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Animation | framer-motion |
| Routing | react-router-dom |
| Icons | lucide-react |
| Extras | canvas-confetti, zustand |
| Fonts | Azonix · Conthrax · Nasalization · Audiowide · Orbitron · Blanka (cdnfonts) + JetBrains Mono |

## Routes

- `/` — home: preloader → hero → skill marquee → about (3 tabs) → contact
- `/work` — systems catalog: bento grid (3D tilt cards) + hacker terminal CLI (keys `1` / `2`), code inspector modal

## Terminal commands (`/work`)

```
ls                list all repositories
cat <repo>        open the GitHub repository in a new tab
init <repo>       open the README / release page
grep <repo>       print full card metadata for a repo
clear             clear the buffer
```

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # typecheck + production build → dist/
npm run preview  # serve the production build
```

## Deploy

Any static host works. The repo ships with [`vercel.json`](vercel.json) SPA rewrites, so on Vercel it's zero-config:

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Vite** (auto-detected). Build `npm run build`, output `dist`.

## Personalization

All identity and content live in a few data files:

| What | Where |
| --- | --- |
| Name, handle, GitHub URL, avatar, email | [`src/data/types.ts`](src/data/types.ts) |
| Projects (cards, tags, snippets, links) | [`src/data/projects.ts`](src/data/projects.ts) |
| Marquee items + tech-stack taxonomy | [`src/data/stack.ts`](src/data/stack.ts) |
| Hero / about copy | [`src/components/Hero.tsx`](src/components/Hero.tsx), [`src/components/About.tsx`](src/components/About.tsx) |

Project counts (`PEEK THE STASH (n)`, `n REPOSITORIES`) derive automatically from the project list.
