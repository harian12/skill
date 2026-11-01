---
name: hono-be
description: Scaffold dan buat backend project Hono modular domain-driven dengan Bun, Drizzle ORM, MySQL/MariaDB, Redis, Zod, SMTP mailer, vendor services, dan Bruno collection sesuai arsitektur standar.
allowed-tools: Read Write Edit Glob Grep Shell
---

# Hono Backend Engineering Reference (Adaptive Senior Standard)

Gunakan skill ini untuk menginisialisasi project backend Hono baru atau menambahkan modul domain baru dengan arsitektur **domain-driven modular**, performa tinggi, clean code, dan standar keamanan ketat. Adaptasikan dengan arsitektur project yang sudah ada dan jangan memaksakan template jika tidak proporsional.

---

## 0. Prinsip Senior & Decision Gate

Sebelum mengimplementasikan kode, tentukan terlebih dahulu:
1. **Status Project**: Apakah project baru (fresh scaffold) atau existing? **Dilarang keras menimpa atau men-scaffold ulang project yang sudah berjalan**.
2. **Kompleksitas Domain**: Apakah modul sederhana (CRUD biasa) atau domain kritis (keuangan, inventory, transaksi multi-step)?
3. **Konvensi & Integrasi**: Hormati konvensi folder, nama, dan stack yang sudah terpasang. Gunakan komponen yang ada sebelum membuat abstraksi baru.

### Referensi Mendalam & Review Checklists
Gunakan berkas referensi modular saat menghadapi kasus khusus:
- Arsitektur & Seam: `references/architecture.md`
- Database & Indeks: `references/database-design.md`
- Transaksi, Locking & Idempotency: `references/transactions-concurrency.md`
- Security, Sanitasi & IDOR: `references/security.md`
- Redis Reliability & Background Queue: `references/reliability-redis-queue.md`
- Desain API & Kontrak: `references/api-design.md`
- Strategi Testing: `references/testing.md`
- Observabilitas & Logging: `references/production-observability.md`
- Review Checklist: `checklists/implementation-review.md` & `checklists/security-review.md`

---

## 1. Panduan Alur Kerja Agen (Workflow Checklist)

Pilih salah satu alur kerja saat mengeksekusi instruksi:

### Alur A: Inisialisasi Project Baru (Scaffold New Project)
1. Inisialisasi runtime & package: `bun init -y` lalu pasang dependencies terbaru.
2. Setup konfigurasi: `tsconfig.json`, `drizzle.config.ts`, `.env.example`, `.env`, `.gitignore`.
3. Buat core modules:
   - `src/core/config/env.ts` (validasi environment variables fail-fast via Zod).
   - `src/core/db/index.ts` & `src/core/db/redis.ts` (koneksi MySQL connection pool & Redis client).
   - `src/core/db/schema/` (skema tabel inti: `users.ts`, barrel export `index.ts`).
   - `src/core/helpers/` (`cache.helper.ts` fail-safe Redis cache & session, `auth.helper.ts`, barrel export `index.ts`).
   - `src/core/utils/response.util.ts` (`apiSuccess`, `apiPaginated`, `apiError`).
   - `src/core/utils/auth.util.ts` (hashing Argon2id untuk password/PIN, signing JWT).
   - `src/core/middlewares/` (`auth.middleware.ts`, `logger.middleware.ts`, `rateLimit.middleware.ts`).
   - `src/core/mail/` (transporter pool SMTP, template HTML responsif, dan fungsi `sendEmail`).
   - `src/core/services/` (integrasi API vendor pihak ketiga dengan native fetch, timeout, dan Zod contract).
   - `src/core/db/seed.ts` (database seeder awal).
4. Buat entry point `src/index.ts`: Pasang CORS, logger, health check `/health`, 404 handler, error handler, dan graceful shutdown.
5. Inisialisasi folder koleksi Bruno di luar proyek (`../bruno/`) lengkap dengan `bruno.json` dan environment `Local.bru`.
6. Jalankan `bun test` atau `bun run dev` untuk verifikasi bootstrap berjalan sempurna.

### Alur B: Tambah Modul Domain Baru (Add New Module)
1. **Drizzle Schema**: Buat file skema tabel di `src/core/db/schema/[domain].ts`.
2. **Export Schema**: Daftarkan schema baru di barrel file `src/core/db/schema/index.ts`.
3. **Pola 5 Berkas Modul**: Buat direktori `src/modules/[domain]/`:
   - `[domain].schema.ts`: Skema validasi Zod untuk payload input, update, dan query parameters.
   - `[domain].service.ts`: Logika bisnis & query Drizzle murni. Validasi kepemilikan resource, gunakan `db.transaction` jika multi-tabel, hindari loop N+1, sertakan komentar Bahasa Indonesia.
   - `[domain].controller.ts`: Ekstraksi context HTTP, pemanggilan service, formatting response via `apiSuccess` / `apiPaginated` / `apiError`.
   - `[domain].route.ts`: Router Hono, middleware `requireAuth`, `requireRole`, binding `zValidator`.
   - `[domain].test.ts`: Self-check unit test runnable via `bun test`.
4. **Mount Route**: Daftarkan router di `src/index.ts`: `app.route('/api/[domain]', domainRoute)`.
5. **Database Migration**: Jalankan `bun run db:generate` lalu `bun run db:migrate` (atau `bun run db:push`).
6. **Koleksi Bruno**: Buat file `.bru` di folder luar (`../bruno/[Nomor]-[Domain]/[Endpoint].bru`) lengkap dengan query, header token, dan payload body JSON.
7. **Verifikasi**: Jalankan `bun test` untuk memastikan semua test suite hijau (0 fail).

---

## 2. Setup Project & Dependencies (Versi Terbaru)

Gunakan runtime **Bun**. Jalankan perintah instalasi berikut:

```bash
# Inisialisasi Project Bun
bun init -y

# Dependency Utama (Latest)
bun add hono @hono/zod-validator zod drizzle-orm mysql2 ioredis argon2 jsonwebtoken uuid nodemailer

# Dev Dependencies (Latest)
bun add -d drizzle-kit @types/jsonwebtoken @types/uuid @types/node @types/bun @types/nodemailer
```

Konfigurasi `scripts` di `package.json`:
```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "build": "bun build src/index.ts --outdir ./build --target bun",
    "start": "bun run src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:seed": "bun run src/core/db/seed.ts",
    "test": "bun test",
    "typecheck": "bun check"
  }
}
```

Konfigurasi `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "types": ["bun"],
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 3. Struktur Direktori Standar

```text
├── drizzle/                      # File migrasi SQL hasil generate Drizzle
├── src/
│   ├── index.ts                  # Bootstrap server, global middlewares, routing, health check
│   ├── core/                     # Shared kernel lintas domain
│   │   ├── config/
│   │   │   └── env.ts            # Validasi fail-fast environment variables via Zod
│   │   ├── db/
│   │   │   ├── index.ts          # MySQL pool connection & Drizzle client
│   │   │   ├── redis.ts          # ioredis client (session caching)
│   │   │   ├── seed.ts           # Database seeder awal
│   │   │   └── schema/           # Tabel-tabel Drizzle
│   │   │       ├── index.ts      # Barrel export semua schema
│   │   │       ├── users.ts      # Tabel user / otentikasi
│   │   │       └── [domain].ts   # Tabel domain fitur spesifik
│   │   ├── helpers/              # Helper IO/koneksi eksternal & data transformer lintas domain
│   │   │   ├── index.ts          # Barrel export semua helpers
│   │   │   ├── cache.helper.ts   # Fail-safe Redis cache & session helper
│   │   │   └── auth.helper.ts    # Sanitizer data user (strip passwordHash, pinCode)
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts       # Validasi bearer token dari Redis/JWT & role guard
│   │   │   ├── logger.middleware.ts     # Structured JSON request/response logger
│   │   │   └── rateLimit.middleware.ts  # Redis sliding-window rate limiter
│   │   ├── mail/                 # Modul email SMTP
│   │   │   ├── config.ts         # Transporter nodemailer (connection pool)
│   │   │   ├── index.ts          # Fungsi sendEmail & tipe email
│   │   │   └── templates/        # Template HTML responsif (otp.template.ts, dll)
│   │   ├── services/             # Integrasi API vendor eksternal lintas modul
│   │   │   └── [vendor].service.ts
│   │   └── utils/
│   │       ├── auth.util.ts      # Hash/verify Argon2id & sign/verify JWT
│   │       └── response.util.ts  # Standard response formatter (apiSuccess, apiPaginated, apiError)
│   └── modules/                  # Domain-driven feature modules
│       └── [module-name]/
│           ├── [module-name].schema.ts      # Validasi payload Zod & query filter
│           ├── [module-name].service.ts     # Business logic & query Drizzle (komentar Bahasa Indonesia)
│           ├── [module-name].controller.ts  # Request parsing & JSON response builder
│           ├── [module-name].route.ts       # Hono route & middleware binding
│           └── [module-name].test.ts        # Self-check unit test module
├── ../bruno/                     # Koleksi request Bruno API (DI LUAR FOLDER BACKEND)
│   ├── bruno.json
│   ├── environments/Local.bru
│   └── [nomor]-[domain]/
│       └── [action].bru
├── .env.example
├── bun.lock
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## 4. Implementasi Core Standar

### A. Fail-Fast Environment Validation (`src/core/config/env.ts`)
```typescript
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('3306'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET minimal 16 karakter'),
  JWT_REFRESH_SECRET: z.string().min(16),
  // SMTP Mailer Config
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587'),
  SMTP_SECURE: z.string().default('false'), // true untuk port 465, false untuk 587
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@domain.com'),
  // Vendor Integration Config
  VENDOR_BASE_URL: z.string().url().optional(),
  VENDOR_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

### B. Standard Response Formatter (`src/core/utils/response.util.ts`)
```typescript
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Format response sukses single data / aksi
export const apiSuccess = <T>(data: T, message?: string) => ({
  success: true,
  data,
  ...(message ? { message } : {}),
})

// Format response list data terpaginasi
export const apiPaginated = <T>(items: T[], pagination: PaginationMeta, message?: string) => ({
  success: true,
  data: {
    items,
    pagination,
  },
  ...(message ? { message } : {}),
})

// Format response error standar
export const apiError = (message: string, code?: string | number) => ({
  success: false,
  message,
  ...(code ? { code } : {}),
})
```

### C. Database & Redis Client (`src/core/db/index.ts` & `redis.ts`)
```typescript
// src/core/db/index.ts
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { env } from '../config/env'
import * as schema from './schema'

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT, 10),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export const db = drizzle(pool, { schema, mode: 'default' })
```

```typescript
// src/core/db/redis.ts
import Redis from 'ioredis'
import { env } from '../config/env'

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  password: env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
})

redis.on('error', (err) => console.warn('Redis warning (fail-open mode):', err.message))
```

### D. Authentication Middleware (`src/core/middlewares/auth.middleware.ts`)
Validasi session terpusat di Redis via helper dengan fallback ke JWT:
```typescript
import type { Context, Next } from 'hono'
import { getSession } from '../helpers'
import { verifyToken } from '../utils/auth.util'

export const requireAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized: Token tidak ditemukan' }, 401)
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return c.json({ success: false, message: 'Unauthorized: Format token salah' }, 401)
  }

  try {
    // Ambil sesi user dari cache Redis (fail-open ke verifyToken jika cache kosong / redis offline)
    let user: any = await getSession(token)

    if (!user) {
      user = verifyToken(token)
    }

    if (!user) {
      return c.json({ success: false, message: 'Sesi telah berakhir atau token tidak valid' }, 401)
    }

    if (!user.sub && user.id) user.sub = user.id
    if (!user.id && user.sub) user.id = user.sub

    c.set('user', user)
    await next()
  } catch {
    return c.json({ success: false, message: 'Token tidak valid atau kadaluarsa' }, 401)
  }
}

// Role-based access control guard
export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user')
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ success: false, message: 'Forbidden: Akses ditolak untuk role Anda' }, 403)
    }
    await next()
  }
}
```

### E. Helper Standar (`src/core/helpers/cache.helper.ts`)
Operasi cache Redis fail-safe dan penanganan sesi terpusat:
```typescript
import { redis } from '../db/redis'
import type { JwtPayload } from '../utils/auth.util'

const DEFAULT_SESSION_TTL = 7 * 24 * 3600

// Helper: Menyimpan data ke Redis cache dengan proteksi fail-safe
export const setCache = async <T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> => {
  try {
    if (redis.status === 'ready') {
      const serialized = JSON.stringify(value)
      if (ttlSeconds && ttlSeconds > 0) {
        await redis.set(key, serialized, 'EX', ttlSeconds)
      } else {
        await redis.set(key, serialized)
      }
      return true
    }
  } catch (err) {
    console.warn(`Redis set cache error for key "${key}":`, err)
  }
  return false
}

// Helper: Mengambil data dari Redis cache dan deserialize JSON
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (redis.status === 'ready') {
      const data = await redis.get(key)
      if (data) return JSON.parse(data) as T
    }
  } catch (err) {
    console.warn(`Redis get cache error for key "${key}":`, err)
  }
  return null
}

// Helper: Menghapus data dari Redis cache
export const delCache = async (key: string): Promise<boolean> => {
  try {
    if (redis.status === 'ready') {
      await redis.del(key)
      return true
    }
  } catch (err) {
    console.warn(`Redis del cache error for key "${key}":`, err)
  }
  return false
}

export const cacheSession = async (token: string, payload: JwtPayload, ttl = DEFAULT_SESSION_TTL) =>
  await setCache(`token:${token}`, payload, ttl)

export const getSession = async (token: string) =>
  await getCache<JwtPayload>(`token:${token}`)

export const deleteSession = async (token: string) =>
  await delCache(`token:${token}`)
```

### F. Auth Util (`src/core/utils/auth.util.ts`)
```typescript
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface JwtPayload {
  id: string
  sub: string
  role: string
  iat?: number
  exp?: number
}

// Hash password menggunakan Argon2id
export const hashPassword = async (plain: string): Promise<string> =>
  argon2.hash(plain, { type: argon2.argon2id })

// Verifikasi password terhadap hash Argon2id yang tersimpan
export const verifyPassword = async (hash: string, plain: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, plain)
  } catch {
    return false
  }
}

// Buat access token JWT dengan masa berlaku 1 hari
export const signToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1d' })

// Verifikasi dan decode token JWT
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}
```

### G. Rate Limit Middleware (`src/core/middlewares/rateLimit.middleware.ts`)
```typescript
import type { Context, Next } from 'hono'
import { redis } from '../db/redis'
import { apiError } from '../utils/response.util'

interface RateLimitOptions {
  windowSeconds: number // Durasi window sliding dalam detik
  maxRequests: number   // Maksimum request dalam window
  keyPrefix?: string    // Prefix key Redis untuk isolasi endpoint
}

// Middleware rate limiter berbasis Redis sliding window
export const createRateLimit = ({ windowSeconds, maxRequests, keyPrefix = 'rl' }: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    // Jika Redis tidak tersedia, lewati rate limit (fail-open)
    if (redis.status !== 'ready') return next()

    const ip = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown'
    const key = `${keyPrefix}:${c.req.path}:${ip}`

    try {
      const current = await redis.incr(key)
      if (current === 1) await redis.expire(key, windowSeconds)

      if (current > maxRequests) {
        return c.json(apiError('Terlalu banyak permintaan. Coba lagi nanti.', 429), 429)
      }
    } catch {
      // Fail-open: jika Redis error, izinkan request berlanjut
    }

    return next()
  }
}

// Preset rate limit untuk endpoint sensitif (login, OTP, register)
export const strictRateLimit = createRateLimit({ windowSeconds: 60, maxRequests: 5, keyPrefix: 'rl:strict' })

// Preset rate limit untuk endpoint umum API
export const defaultRateLimit = createRateLimit({ windowSeconds: 60, maxRequests: 60, keyPrefix: 'rl:default' })
```

### H. Drizzle Config (`drizzle.config.ts`)
```typescript
import { defineConfig } from 'drizzle-kit'
import { env } from './src/core/config/env'

// Konfigurasi Drizzle Kit untuk generate dan migrate schema MySQL
export default defineConfig({
  dialect: 'mysql',
  schema: './src/core/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT, 10),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
})
```

### I. Entry Point & Graceful Shutdown (`src/index.ts`)
```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { db, pool } from './core/db'
import { redis } from './core/db/redis'
import { apiError } from './core/utils/response.util'

const app = new Hono()

// Pasang CORS, logger, dan default rate limit
app.use('*', cors())
app.use('*', logger())

// Health check endpoint — digunakan load balancer untuk readiness probe
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Centralized error handler — jangan bocorkan detail stack atau SQL ke client
app.onError((err, c) => {
  console.error('[App Error]', err.message)
  return c.json(apiError('Terjadi kesalahan pada server. Coba lagi nanti.'), 500)
})

// 404 handler untuk route yang tidak terdaftar
app.notFound((c) => c.json(apiError('Endpoint tidak ditemukan.', 404), 404))

// Mount route domain (tambahkan di sini setiap modul baru)
// app.route('/api/categories', categoriesRoute)

const server = Bun.serve({
  port: parseInt(process.env.PORT ?? '3000', 10),
  fetch: app.fetch,
})

console.log(`Server berjalan di http://localhost:${server.port}`)

// Graceful shutdown — tutup DB pool dan Redis saat menerima sinyal sistem
const shutdown = async (signal: string) => {
  console.log(`[Shutdown] Menerima sinyal ${signal}, menutup koneksi...`)
  server.stop()
  await pool.end()
  await redis.quit()
  console.log('[Shutdown] Semua koneksi berhasil ditutup.')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
```

---

## 5. Aturan Autentikasi & Keamanan Hak Akses

1. **Ambil Identitas Pengguna dari Token Context**:
   - Jangan pernah mempercayai `userId` dari body request untuk resource privat! Selalu ambil dari konteks token yang sudah diverifikasi:
   ```typescript
   const user = c.get('user')
   const userId = user?.id || user?.sub
   ```
2. **Validasi Kepemilikan Data (Ownership Validation)**:
   - Pada operasi update/delete data privat pengguna, selalu sertakan filter kepemilikan:
   ```typescript
   where(and(eq(table.id, id), eq(table.userId, userId)))
   ```
3. **Primary Key UUIDv7**:
   - Gunakan `v7 as uuidv7` dari package `uuid` untuk seluruh entitas agar ID terurut waktu dan performa B-Tree index optimal:
   ```typescript
   id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => uuidv7())
   ```

---

## 6. Aturan Database & Performa Query

### ⚠️ DILARANG Query Database di Dalam Loop (`for`, `forEach`, `map`)
Pemanggilan query DB di dalam perulangan memicu masalah **N+1 Query** yang membebani database:

```typescript
// ❌ ANTI-PATTERN: N kali roundtrip ke database
for (const item of items) {
  await db.insert(orderItems).values(item)
}

// ✅ BEST PRACTICE: Batch Insert (1 kali eksekusi)
if (items.length > 0) {
  await db.insert(orderItems).values(items)
}

// ✅ BEST PRACTICE: Batch Select menggunakan inArray (1 kali eksekusi)
import { inArray } from 'drizzle-orm'
if (itemIds.length > 0) {
  const list = await db.select().from(table).where(inArray(table.id, itemIds))
}
```

### Database Transaction (`db.transaction`)
Operasi multi-tabel atau proses yang mengubah nilai kritis (saldo, kuota, checkout) **WAJIB** dibungkus transaksi database:
```typescript
return await db.transaction(async (tx) => {
  await tx.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, walletId))
  await tx.insert(walletLogs).values(logData)
  return result
})
```

### Seleksi Kolom Eksplisit (Hindari SELECT *)
Dilarang menggunakan `db.select().from(table)` tanpa filter kolom jika tabel mengandung field sensitif (passwordHash, pinCode, secret). Gunakan `db.select({ id: table.id, name: table.name }).from(table)` untuk membatasi payload dan mencegah data sensitif bocor ke response.

### Kapan Gunakan Cursor vs Offset Pagination
- **Offset Pagination** (`LIMIT x OFFSET y`): Digunakan untuk data statis dengan total record yang perlu ditampilkan (dashboard admin, laporan). Mudah diimplementasikan tapi kurang efisien untuk dataset sangat besar.
- **Cursor Pagination** (`WHERE id > lastId ORDER BY id`): Wajib digunakan untuk feed real-time, data yang terus berubah, atau dataset >100k record. Lebih performa karena tidak menghitung offset yang besar.

---

## 7. Standar Response API & Aturan Ketat Pagination vs All

### ⚠️ 1 Endpoint = 1 Format Respons Pasti
- **DILARANG KERAS** mengubah struktur response secara dinamis (misal return paginasi jika tanpa query, return array jika ada query `?all=true`). Format respons harus deterministik.

### A. Endpoint Koleksi Terpaginasi (`GET /api/[domain]`)
Digunakan untuk tabel dan list data besar. Selalu gunakan `apiPaginated`:
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

### B. Endpoint Koleksi All Data (`GET /api/[domain]/all`)
Khusus digunakan untuk **dropdown, select picker, atau combobox**:
- **Wajib menggunakan sub-path `/all`**.
- Mengembalikan array data murni via `apiSuccess`:
```json
{
  "success": true,
  "data": [
    { "id": "uuid-1", "name": "Item A" },
    { "id": "uuid-2", "name": "Item B" }
  ]
}
```

### C. Backward Compatibility API Contract
Jika endpoint yang sudah digunakan client aktif perlu diubah response contract-nya, wajib:
1. Tambahkan field baru tanpa menghapus field lama (additive change).
2. Jika tidak terhindarkan, buat versi baru endpoint (`/api/v2/[domain]`) dan beri deprecated notice pada versi lama.
3. Dilarang mengubah tipe data, nama field, atau struktur response yang sudah ada secara sembarangan.

### D. Rate Limit pada Endpoint Sensitif
Wajib pasang rate limit ketat (`strictRateLimit`) pada endpoint berisiko tinggi:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/otp`
- Semua endpoint public yang dapat diakses tanpa autentikasi.

---

## 8. Aturan Dokumentasi Komentar Kode (Bahasa Indonesia)

1. **Wajib di Seluruh File Kode**: Setiap berkas kode tanpa terkecuali (baik di level `core/`, `db/`, `middlewares/`, `helpers/`, `utils/`, `mail/`, `services/`, maupun `modules/` [schema, service, controller, route, test]) **WAJIB** diberikan komentar penjelasan alur dan fungsinya dalam **Bahasa Indonesia**.
2. **Komentar Bertahap**: Berikan komentar terstruktur pada setiap tahapan logika (contoh: `// 1. Validasi keberadaan data`, `// 2. Kalkulasi nominal`, `// 3. Simpan perubahan ke database`).
3. **Identifier Tetap Bahasa Inggris**: Nama variabel, fungsi, tipe data, route, dan sintaks kode tetap menggunakan Bahasa Inggris baku (contoh: `getItemsService`, `calculateTotal`, `userId`).

---

## 9. Standar Koleksi Bruno API (`.bru`)

Setiap kali selesai membuat atau memperbarui endpoint API, **WAJIB** membuat atau memperbarui berkas koleksi Bruno di folder luar (`../bruno/`):

- **Struktur Folder Kategori**: Gunakan format nomor urut domain (contoh: `01-Auth`, `02-Users`, `03-Products`, `04-Orders`).
- **Nama Berkas**: Format Kebab-Case deskriptif (contoh: `Create-Item.bru`, `Update-Status.bru`).
- **Template Berkas `.bru`**:
```bru
meta {
  name: Nama Endpoint
  type: http
  seq: 1
}

post {
  url: {{baseUrl}}/api/domain/path
  body: json
  auth: bearer
}

headers {
  Content-Type: application/json
}

auth:bearer {
  token: {{token}}
}

body:json {
  {
    "key": "value"
  }
}
```
*(Gunakan `auth: none` dan `body: none` jika endpoint bersifat publik atau method GET tanpa body).*

---

## 10. Template Modul Domain Lengkap (Pola 5 File)

Contoh implementasi modul `categories`:

### 1. `categories.schema.ts`
```typescript
import { z } from 'zod'

// Skema validasi data kategori baru
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(100),
  type: z.enum(['INCOME', 'EXPENSE']).default('EXPENSE'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

// Skema update kategori
export const updateCategorySchema = createCategorySchema.partial()

// Skema query parameter list kategori
export const queryCategorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type QueryCategoryInput = z.infer<typeof queryCategorySchema>
```

### 2. `categories.service.ts`
```typescript
import { and, count, desc, eq, ilike } from 'drizzle-orm'
import { v7 as uuidv7 } from 'uuid'
import { db } from '../../core/db'
import { categories } from '../../core/db/schema'
import type { CreateCategoryInput, QueryCategoryInput, UpdateCategoryInput } from './categories.schema'

// Proses mengambil daftar kategori terpaginasi
export const getCategoriesService = async (query: QueryCategoryInput) => {
  // 1. Tentukan parameter paginasi
  const offset = (query.page - 1) * query.limit
  const conditions = []

  if (query.search && query.search.trim().length > 0) {
    conditions.push(ilike(categories.name, `%${query.search.trim()}%`))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // 2. Hitung total data
  const [totalRes] = await db
    .select({ total: count() })
    .from(categories)
    .where(whereClause)

  const total = Number(totalRes?.total || 0)

  // 3. Ambil baris data kategori
  const items = await db
    .select()
    .from(categories)
    .where(whereClause)
    .orderBy(desc(categories.createdAt))
    .limit(query.limit)
    .offset(offset)

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

// Proses mengambil semua kategori aktif untuk dropdown
export const getAllCategoriesService = async () => {
  return await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.name)
}

// Proses pembuatan kategori baru
export const createCategoryService = async (data: CreateCategoryInput) => {
  const id = uuidv7()
  await db.insert(categories).values({
    id,
    name: data.name.trim(),
    type: data.type,
    description: data.description || null,
    isActive: data.isActive,
  })

  const [created] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)

  return created
}
```

### 3. `categories.controller.ts`
```typescript
import type { Context } from 'hono'
import { apiError, apiPaginated, apiSuccess } from '../../core/utils/response.util'
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoriesService,
} from './categories.service'

// Controller untuk mengambil daftar kategori terpaginasi
export const getCategoriesController = async (c: Context) => {
  try {
    const query = c.req.valid('query' as never)
    const { items, pagination } = await getCategoriesService(query)
    return c.json(apiPaginated(items, pagination))
  } catch (error: any) {
    return c.json(apiError(error.message || 'Gagal mengambil data kategori'), 500)
  }
}

// Controller untuk mengambil seluruh kategori aktif (opsi dropdown)
export const getAllCategoriesController = async (c: Context) => {
  try {
    const items = await getAllCategoriesService()
    return c.json(apiSuccess(items))
  } catch (error: any) {
    return c.json(apiError(error.message || 'Gagal memuat opsi kategori'), 500)
  }
}

// Controller untuk membuat kategori baru
export const createCategoryController = async (c: Context) => {
  try {
    const body = c.req.valid('json' as never)
    const data = await createCategoryService(body)
    return c.json(apiSuccess(data, 'Kategori berhasil dibuat'), 201)
  } catch (error: any) {
    return c.json(apiError(error.message || 'Gagal membuat kategori'), 400)
  }
}
```

### 4. `categories.route.ts`
```typescript
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { requireAuth, requireRole } from '../../core/middlewares/auth.middleware'
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoriesController,
} from './categories.controller'
import { createCategorySchema, queryCategorySchema } from './categories.schema'

const categoriesRoute = new Hono()

// Proteksi seluruh route kategori dengan otentikasi
categoriesRoute.use('*', requireAuth)

// GET /api/categories: Daftar kategori terpaginasi
categoriesRoute.get('/', zValidator('query', queryCategorySchema), getCategoriesController)

// GET /api/categories/all: Seluruh kategori aktif (dropdown)
categoriesRoute.get('/all', getAllCategoriesController)

// POST /api/categories: Buat kategori baru (Role admin)
categoriesRoute.post(
  '/',
  requireRole(['ADMIN']),
  zValidator('json', createCategorySchema),
  createCategoryController
)

export default categoriesRoute
```

### 5. `categories.test.ts`
```typescript
import { describe, expect, it } from 'bun:test'
import { createCategorySchema, queryCategorySchema } from './categories.schema'

describe('Categories Module Schema & Self-Check', () => {
  it('harus memvalidasi pembuatan kategori dengan nilai yang benar', () => {
    const validData = {
      name: 'Operasional',
      type: 'EXPENSE',
      description: 'Biaya operasional bulanan',
    }

    const parsed = createCategorySchema.parse(validData)
    expect(parsed.name).toBe('Operasional')
    expect(parsed.type).toBe('EXPENSE')
  })

  it('harus menolak jika nama kategori kosong', () => {
    const invalidData = {
      name: '',
      type: 'EXPENSE',
    }

    expect(() => createCategorySchema.parse(invalidData)).toThrow()
  })

  it('harus mengatur nilai default pagination pada query schema', () => {
    const query = queryCategorySchema.parse({})
    expect(query.page).toBe(1)
    expect(query.limit).toBe(10)
  })
})
```

---

## 11. Standar Penulisan Utils vs Helpers

Pemisahan tanggung jawab antara `utils` dan `helpers`:

### A. Utils (`src/core/utils/<nama>.util.ts`)
- Fungsi murni (**pure function**), generik, dan bebas dependensi state/koneksi eksternal.
- Tidak boleh melakukan panggilan IO runtime (tidak ada akses langsung ke database, Redis, atau jaringan eksternal).
- Contoh: Formatter response HTTP (`response.util.ts`), hashing Argon2id & JWT sign/verify (`auth.util.ts`), kalkulasi printer nota thermal ESC/POS (`receipt.util.ts`).

### B. Helpers (`src/core/helpers/<nama>.helper.ts`)
- Fungsi pembantu operasional yang berinteraksi dengan infrastruktur eksternal (Redis cache, third-party client) atau transformasi data entitas lintas modul.
- **Wajib Export**: Setiap helper baru wajib didaftarkan di barrel file `src/core/helpers/index.ts`.
- Contoh: Operasi Redis cache & session guard (`cache.helper.ts`), pembersihan field sensitif entitas database seperti `passwordHash` (`auth.helper.ts`).

### C. Prinsip Fail-Safe untuk Helper IO
- Helper yang mengakses IO/infrastruktur (seperti Redis) **wajib** memvalidasi ketersediaan koneksi (misal: `redis.status === 'ready'`).
- Wajib dibungkus blok `try/catch` tanpa melempar fatal error ke caller (fail-open mode), dan mencatat warning via `console.warn` agar request lifecycle aplikasi tidak crash saat cache server offline.

### D. Type-Safety & Generics
- Gunakan generic type (`<T>`) pada fungsi caching atau serialisasi agar tipe data hasil deserialize tetap presisi saat dikonsumsi layer controller/service.

---

## 12. Standar Layanan Integrasi API Vendor (External Services)

Simpan integrasi vendor pihak ketiga (payment gateway, ekspedisi kurir, SMS/WhatsApp gateway, dsb) di:
- `src/core/services/[vendor].service.ts` jika dipakai lintas modul.
- `src/modules/[domain]/services/[vendor].service.ts` jika spesifik pada satu domain tertentu.

### A. Aturan Wajib Layanan Integrasi Vendor
1. **Native Fetch & AbortSignal Timeout**:
   - Wajib gunakan native `fetch` dengan batas timeout toleransi (misal 10–15 detik) via `AbortSignal.timeout(ms)`. Dilarang membiarkan request HTTP menggantung tanpa timeout.
2. **Validasi Skema Request & Response (Zod Parsing)**:
   - Definisikan skema Zod untuk response payload dari vendor. Vendor eksternal sewaktu-waktu dapat mengubah response atau mengalami kegagalan. Jangan asumsikan struktur payload selalu benar.
3. **Kerahasiaan Kredensial**:
   - Base URL, API Key, Token, Client Secret **wajib** diambil dari `src/core/config/env.ts`. Dilarang keras menulis hardcoded credentials di dalam file service.
4. **Sanitasi Error & Logging**:
   - Tangani status HTTP non-2xx dari vendor.
   - **DILARANG** membocorkan raw error, endpoint internal vendor, atau kredensial ke response client. Bungkus dan lempar internal exception, lalu tangani di controller via `apiError('Gagal memproses transaksi dengan layanan pihak ketiga', 502)`.
   - Catat log request dan response vendor. Wajib menyamarkan (masking) data sensitif seperti header `Authorization`, signature, nomor kartu/rekening, PIN, dan password sebelum disimpan ke log.
5. **Idempotency & Audit**:
   - Untuk integrasi mutasi finansial atau status penting, selalu kirimkan header idempotency (misal: `X-Idempotency-Key` atau nomor referensi internal sistem) untuk mencegah double-charge akibat network retry.

### B. Contoh Implementasi Service Vendor (`src/core/services/paymentVendor.service.ts`)
```typescript
import { z } from 'zod'
import { env } from '../config/env'

// 1. Skema response yang diharapkan dari vendor
const vendorChargeResponseSchema = z.object({
  transactionId: z.string(),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED']),
  amount: z.number(),
  paymentUrl: z.string().url().optional(),
})

export type VendorChargeResponse = z.infer<typeof vendorChargeResponseSchema>

export interface CreateVendorChargeInput {
  orderId: string
  amount: number
  customerEmail: string
}

// 2. Service pemanggil API vendor eksternal
export const createVendorChargeService = async (
  payload: CreateVendorChargeInput
): Promise<VendorChargeResponse> => {
  const timeoutMs = 15000 // 15 detik batas toleransi

  if (!env.VENDOR_BASE_URL || !env.VENDOR_API_KEY) {
    throw new Error('Konfigurasi vendor eksternal belum lengkap di env')
  }

  try {
    const response = await fetch(`${env.VENDOR_BASE_URL}/v1/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.VENDOR_API_KEY}`,
        'X-Idempotency-Key': payload.orderId,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Vendor API Error] HTTP ${response.status}:`, errorText)
      throw new Error(`Vendor merespon dengan status ${response.status}`)
    }

    const data = await response.json()
    // Validasi struktur kembalian vendor
    return vendorChargeResponseSchema.parse(data)
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      console.error('[Vendor API Timeout] Batas waktu 15 detik terlampaui')
      throw new Error('Koneksi layanan eksternal timeout')
    }
    console.error('[Vendor API Exception]:', error.message)
    throw new Error('Gagal memproses layanan eksternal')
  }
}
```

---

## 13. Layanan Email SMTP (Config, Template, & Function)

Gunakan `nodemailer` dengan connection pool di `src/core/mail/` untuk pengiriman email transaksional (OTP, verifikasi akun, notifikasi invoice).

### A. Konfigurasi Transporter Pool (`src/core/mail/config.ts`)
```typescript
import nodemailer from 'nodemailer'
import { env } from '../config/env'

export const mailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT, 10),
  secure: env.SMTP_SECURE === 'true', // true untuk SSL (port 465), false untuk TLS (port 587)
  auth: env.SMTP_USER && env.SMTP_PASS ? {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  } : undefined,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
})
```

### B. Template Email Responsif (`src/core/mail/templates/otp.template.ts`)
```typescript
export interface OtpEmailProps {
  userName: string
  otpCode: string
  expiryMinutes: number
}

// Template HTML email responsif dan modern
export const renderOtpEmail = ({ userName, otpCode, expiryMinutes }: OtpEmailProps): string => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .content { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .otp-box { background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0284c7; }
    .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">Verifikasi Keamanan</div>
    <div class="content">
      Halo <strong>${userName}</strong>,<br>
      Gunakan kode verifikasi berikut untuk mengonfirmasi akses akun Anda:
    </div>
    <div class="otp-box">
      <div class="otp-code">${otpCode}</div>
    </div>
    <div class="content">
      Kode berlaku selama <strong>${expiryMinutes} menit</strong>. Jangan bagikan kode ini kepada pihak mana pun demi menjaga keamanan data Anda.
    </div>
    <div class="footer">
      Email ini dikirim secara otomatis oleh sistem. Abaikan jika Anda tidak melakukan permintaan ini.
    </div>
  </div>
</body>
</html>
`
```

### C. Fungsi Pengiriman Email Fail-Safe (`src/core/mail/index.ts`)
```typescript
import { env } from '../config/env'
import { mailTransporter } from './config'

export interface SendMailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

// Fungsi pengiriman email terpusat dengan error handling fail-safe
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const info = await mailTransporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''), // Fallback teks polos otomatis
    })

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error(`[SMTP Mail Error] Gagal kirim email ke ${to}:`, error.message)
    return { success: false, error: error.message }
  }
}

export * from './config'
export * from './templates/otp.template'
```

