# Skill & Agent Hub (Hono BE & Nuxt FE)

Repositori standar arsitektur, pedoman AI agent, dan blueprint skill untuk pengembangan backend Hono modular dan frontend Nuxt 4 enterprise. Mengikuti standar **Universal Agent Plugins Specification**.

## Struktur Repositori

```text
├── plugin.json                 # Manifest plugin universal (Agent Plugins Spec)
├── package.json                # Manifest package metadata
├── skills/                     # Folder skill terdaftar
│   ├── hono-be/
│   │   └── SKILL.md            # Blueprint skill backend Hono modular
│   └── nuxt-fe/
│       └── SKILL.md            # Blueprint skill frontend Nuxt 4 enterprise
├── agents/                     # Definisi subagents
│   ├── hono-engineer.md        # Subagent backend Hono
│   └── nuxt-engineer.md        # Subagent frontend Nuxt 4
├── style FE                    # Panduan visual UI & styling frontend
└── README.md
```

## Cara Instalasi

### 1. Di OpenCode Global (`~/.config/opencode/opencode.jsonc`)
Tambahkan repositori ke array `plugin`:
```jsonc
{
  "plugin": [
    "git+https://github.com/harian12/skill.git"
  ]
}
```

### 2. Di Project Lokal (Per-Project)
Clone langsung ke direktori plugin project:
```bash
# Untuk OpenCode
git clone https://github.com/harian12/skill.git .opencode/skill

# Untuk Universal / Cursor / Codex
git clone https://github.com/harian12/skill.git .agents/skill
```

## Kemampuan Utama

### 1. Hono Backend (`skills/hono-be/SKILL.md` & `agents/hono-engineer.md`)
- Runtime Bun dengan arsitektur Hono modular domain-driven.
- Database Drizzle ORM (MySQL/MariaDB) + migrasi kit & pooling.
- Caching & session fail-safe via Redis.
- Aturan anti N+1 query & database transaction.
- Integrasi vendor eksternal (native fetch + AbortSignal timeout + Zod validation).
- Modul SMTP email (Nodemailer pool + template HTML responsif).
- Deterministik API response format (`apiSuccess`, `apiPaginated`, `apiError`).
- Bruno API collection (`../bruno/`).
- Komentar alur Bahasa Indonesia di seluruh berkas kode.

### 2. Nuxt 4 Frontend (`skills/nuxt-fe/SKILL.md` & `agents/nuxt-engineer.md`)
- Nuxt 4 arsitektur 3-layer (`app/`, `server/`, `shared/`).
- Tailwind CSS v4 CSS-first (`@tailwindcss/vite` + `@theme`).
- Primitif UI shadcn-vue (Radix Vue) + utilitas `cn()`.
- Nitro Backend-For-Frontend (BFF) proxy endpoints & header cleaner.
- State management Pinia + form validation Vuelidate.
- Komponen data table, modal konfirmasi, dan empty states.
- Komentar alur Bahasa Indonesia di seluruh berkas kode.
