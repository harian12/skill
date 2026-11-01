# Skill & Agent Hub (Hono BE & Nuxt FE)

Repositori standar arsitektur, pedoman AI agent, dan blueprint skill untuk pengembangan backend Hono dan frontend Nuxt 4.

## Struktur Direktori

```text
├── SKILL-HONO.md             # Blueprint skill backend Hono modular domain-driven
├── SKILL-NUXT.md             # Blueprint skill frontend Nuxt 4 enterprise
├── agents/                   # Definisi subagents OpenCode & Antigravity
│   ├── hono-engineer.md      # Subagent backend Hono
│   └── nuxt-engineer.md      # Subagent frontend Nuxt 4
└── style FE                  # Desain sistem & visual guide frontend
```

## Modul & Kemampuan

### 1. Hono Backend Engineer (`SKILL-HONO.md` & `agents/hono-engineer.md`)
- Runtime Bun dengan Hono modular domain-driven.
- Database Drizzle ORM (MySQL/MariaDB) + migrasi kit & pooling.
- Caching & session fail-safe via Redis.
- Aturan ketat query N+1 & database transaction.
- Integrasi vendor eksternal (native fetch + AbortSignal timeout + Zod validation).
- Modul SMTP email (Nodemailer pool + responsive HTML templates).
- Standard response deterministik (`apiSuccess`, `apiPaginated`, `apiError`).
- Koleksi Bruno API (`../bruno/`).
- Komentar alur Bahasa Indonesia di seluruh file.

### 2. Nuxt 4 Frontend Engineer (`SKILL-NUXT.md` & `agents/nuxt-engineer.md`)
- Nuxt 4 arsitektur 3-layer (`app/`, `server/`, `shared/`).
- Tailwind CSS v4 CSS-first (`@tailwindcss/vite` + `@theme`).
- Primitif UI shadcn-vue (Radix Vue) + utilitas `cn()`.
- Nitro Backend-For-Frontend (BFF) proxy endpoints & header cleaner.
- State management Pinia + form validation Vuelidate.
- Komponen data table, modal konfirmasi, dan empty states.
- Komentar alur Bahasa Indonesia di seluruh file.
