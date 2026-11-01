---
name: nuxt-fe
description: Scaffold dan bangun project Frontend Nuxt 4 enterprise dengan Bun, Tailwind CSS v4, shadcn-vue (Radix Vue), Pinia, Vuelidate, BFF Nitro proxy, dan R2/S3 integration sesuai arsitektur standar.
allowed-tools: Read Write Edit Glob Grep Shell
---

# Nuxt 4 Enterprise Frontend Skill

Gunakan skill ini untuk menginisialisasi project frontend Nuxt 4 baru atau menambahkan modul domain/halaman baru dengan arsitektur Nuxt 4 (`app/` folder), pola BFF (Backend-For-Frontend) Nitro, proteksi autentikasi RBAC, manajemen form Vuelidate, dan komponen UI shadcn-vue (Radix Vue) + Tailwind CSS v4.

---

## 0. Panduan Alur Kerja Agen (Workflow Checklist)

Saat user meminta eksekusi, tentukan alur:

### Alur A: Inisialisasi Project Baru (Scaffold New Project)
1. Inisialisasi runtime & package: Setup `package.json` dengan runtime **Bun**, pasang dependensi Nuxt 4, Pinia, Tailwind v4 (@tailwindcss/vite), shadcn-vue (radix-vue, clsx, tailwind-merge, cva), Vuelidate, `@nuxt/icon`.
2. Setup konfigurasi:
   - `nuxt.config.ts`: `future: { compatibilityVersion: 4 }`, compatibilityDate, runtimeConfig (BFF proxy & R2), Vite Tailwind v4 plugin, modules (`@pinia/nuxt`, `@vueuse/nuxt`, `@nuxt/image`, `@nuxt/icon`, `nuxt-toast`, `shadcn-nuxt`), konfigurasi `shadcn`, CSS path.
   - `app.config.ts`: konfigurasi Icon CSS mode.
   - `app/assets/css/tailwind.css`: `@import "tailwindcss";` dan `@theme` block CSS-first (tanpa legacy `tailwind.config.js`).
   - `.env.example` & `.env`.
3. Buat layer `shared/` (Fitur standar Nuxt 4, auto-imported lintas client & server):
   - `shared/types/`: `type.ts` (`typeResponse`), `auth.type.ts`, dan domain type contracts.
   - `shared/utils/`: shared logic/formatters yang bisa dipakai di Vue maupun Nitro.
4. Buat layer `app/` untuk seluruh kode client:
   - `app/lib/utils.ts`: helper fungsi `cn(...)` (`clsx` + `twMerge`).
   - `app/utils/`: `apiService.util.ts`, client-only formatters (`formatDate.ts`, `formatNumber.ts`).
   - `app/plugins/`: `piniaPersist.client.ts`, `init-user.client.ts`, directive `number.ts`.
   - `app/middleware/`: `tokenExist.ts`, `noToken.ts`, `roleAkses.ts`, `logger.global.ts`.
   - `app/stores/`: `auth.ts`, `user.ts`.
   - `app/layouts/`: `default.vue`, `blank.vue`.
   - `app/components/ui/`: atomic shadcn-vue components (button, dialog, input, label, badge, table, card).
   - `app/components/`: Common (`button.vue`, `modal.vue`, `message_vuelidate.vue`, `Datatable/`) dan Card (`SectionHeader.vue`, `IconAction.vue`, `ModalKonfirm.vue`, `DataEmpty.vue`).
   - `app/app.vue`: entry template dengan `<NuxtLayout />`.
5. Buat server BFF di `server/`:
   - `server/utils/`: `handleErrorApi.ts`, `logger.ts` (Winston), `r2.ts` (S3 Client).
   - `server/middleware/`: `logger.ts`, `removeHeader.ts`.
   - `server/api/`: `login.post.ts`, `logout.delete.ts`, `log.post.ts`.
6. Verifikasi: Jalankan `bun run dev`.

### Alur B: Tambah Modul Halaman CRUD Baru (Add New Feature Module)
1. Definisikan tipe data di `shared/types/[domain].type.ts` (`I[Entity]`, `I[Entity]Create`, `I[Entity]Table`).
2. Buat BFF endpoints di `server/api/[domain]/`:
   - `index.ts` (GET paginate/list via `$fetch` ke backend API).
   - `all.ts` (GET all list untuk dropdown/select/picker tanpa pagination).
   - `index.post.ts` (POST create).
   - `[id].put.ts` (PUT update).
   - `[id].delete.ts` (DELETE remove).
3. Buat Pinia store di `app/stores/[domain].ts` (`useMy[Domain]Store`) dengan integrasi `apiServiceUtil` dan `useToast()`.
4. Buat halaman tampilan di `app/pages/[domain].vue` atau `app/pages/[domain]/index.vue`:
   - Pasang `definePageMeta` (`middleware: ['token-exist', 'role-akses']`, `title`, `desc`, `roles`).
   - Pasang `<CardSectionHeader>`, `<CommonDatatable>`, `<CardDataEmpty>`, form modal `<CommonModal>` + Vuelidate, dan `<CardModalKonfirm>`.

---

## 1. Setup Project & Dependencies

Gunakan runtime **Bun**.

### Dependencies
```bash
# Core App & State
bun add nuxt@^4.3.1 vue@^3.5.28 vue-router@^4.6.4 @pinia/nuxt@0.11.3 pinia-plugin-persistedstate@^4.7.1 @vueuse/nuxt@14.2.1 ofetch@^1.5.1

# Styling & shadcn-vue Primitives (Nuxt 4 + Tailwind CSS v4 via Vite)
bun add tailwindcss@^4.1.18 @tailwindcss/vite@^4.1.18 nuxt-toast@^1.4.0 @nuxt/image@^2.0.0
bun add radix-vue@^1.9.15 class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^3.0.1 lucide-vue-next@^0.475.0

# Validation, Date & Tools
bun add @vuelidate/core@^2.0.3 @vuelidate/validators@^2.0.4 @vuepic/vue-datepicker@^12.1.0 moment@^2.30.1 moment-timezone@^0.6.0 date-fns@^4.1.0 vue-tippy@^6.7.1 exceljs@^4.4.0

# Server-side (BFF, S3, Logging)
bun add @aws-sdk/client-s3@^3.992.0 winston@^3.19.0 winston-daily-rotate-file@^5.0.0 sharp@^0.34.5 tinymce@^8.3.2

# Dev Dependencies
bun add -d shadcn-nuxt@^0.11.0 @nuxt/icon@^2.2.1 @iconify-json/tabler@^1.2.26 @types/node@^25.2.3 @types/moment@^2.13.0
```

### Konfigurasi `package.json`
```json
{
  "name": "FE",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  }
}
```

### Konfigurasi `nuxt.config.ts` (Nuxt 4 Standard)
```typescript
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: false },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  app: {
    head: {
      meta: [
        { name: 'color-scheme', content: 'light' }
      ]
    }
  },
  runtimeConfig: {
    urlcbt: process.env.URLCBT,
    r2: {
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      publicUrl: process.env.R2_SHOW_FILE,
    },
    public: {
      showFile: process.env.R2_SHOW_FILE,
      token: process.env.TOKEN_KEY || 'auth_token',
      tiny: process.env.TINY_KEY
    },
  },
  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/transition.css',
    '~/assets/css/animate.css',
    '~/assets/app.css',
  ],
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
    'nuxt-toast',
    'shadcn-nuxt'
  ],
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  toast: {
    settings: {
      position: 'topCenter',
      timeout: 3000,
      progressBar: false,
    }
  },
  nitro: {
    externals: {
      inline: ['ofetch', 'ipx']
    }
  },
  sourcemap: false,
})
```

### Konfigurasi `app.config.ts`
```typescript
export default defineAppConfig({
  icon: {
    mode: 'css',
    cssLayer: 'base'
  }
})
```

### Konfigurasi `app/assets/css/tailwind.css` (Tailwind CSS v4 CSS-First Theme)
Tailwind v4 menghilangkan `tailwind.config.js`. Konfigurasi tema langsung ditulis di file CSS via direktif `@theme`:
```css
@import "tailwindcss";

@theme {
  --color-dark: #003C6E;
  --color-light: #4F83CC;
  --color-verylight: #D6E9F8;
}
```

### Konfigurasi `.env.example`
```env
URLCBT=http://localhost:2030/api
TOKEN_KEY=auth_token
TINY_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_URL=
R2_SHOW_FILE=
```

---

## 2. Struktur Direktori Standar (Nuxt 4 Architecture)

Nuxt 4 menerapkan arsitektur 3-Layer:
1. `app/`: Kode presentasi client Vue (halaman, layout, komponen, plugin, store, composable).
2. `server/`: Backend Nitro server (BFF proxy endpoint, middleware, S3/R2 client, Winston logger).
3. `shared/`: Layer universal auto-imported lintas `app/` dan `server/` (DTO/type contracts, enum, shared helper).

```text
├── app/                                 # Nuxt 4 Client-side Presentation
│   ├── app.vue                          # Main app entrypoint (<NuxtLayout />)
│   ├── assets/
│   │   └── css/
│   │       └── tailwind.css             # Entry css (@import "tailwindcss"; @theme {...})
│   ├── lib/
│   │   └── utils.ts                     # cn() helper (clsx + tailwind-merge)
│   ├── components/
│   │   ├── ui/                          # shadcn-vue atomic UI primitives
│   │   │   ├── button/
│   │   │   ├── dialog/
│   │   │   ├── input/
│   │   │   ├── label/
│   │   │   ├── table/
│   │   │   └── badge/
│   │   ├── Card/
│   │   │   ├── DataEmpty.vue            # State data kosong
│   │   │   ├── IconAction.vue           # Action button table/card (info/warning/alert)
│   │   │   ├── ModalKonfirm.vue         # Modal dialog konfirmasi aksi bahaya
│   │   │   └── SectionHeader.vue        # Header judul & search/action page
│   │   ├── Common/
│   │   │   ├── button.vue               # Button universal + loading spinner
│   │   │   ├── modal.vue                # Modal dialog universal (size md/lg, zoom)
│   │   │   ├── message_vuelidate.vue    # Error text parser Vuelidate
│   │   │   ├── badge.vue                # Status badge
│   │   │   └── Datatable/
│   │   │       ├── index.vue            # Datatable server-side pagination
│   │   │       ├── header.vue           # Per-page selector & info total
│   │   │       └── Footer.vue           # Pagination navigator
│   │   └── Layout/                      # Admin Navbar, Sidebar, Siswa UI
│   ├── composables/                     # Reactive composables (misal: sidebar.ts)
│   ├── layouts/
│   │   ├── default.vue                  # Main layout admin (Sidebar + Navbar + NuxtPage)
│   │   ├── blank.vue                    # Blank layout (Login/Register)
│   │   └── siswa.vue                    # Student exam layout
│   ├── middleware/
│   │   ├── logger.global.ts             # Route change logger
│   │   ├── tokenExist.ts                # Guard: wajib login, jika tidak redirect '/'
│   │   ├── noToken.ts                   # Guard: jika sudah login, redirect dashboard
│   │   └── roleAkses.ts                 # Guard RBAC: cek to.meta.roles
│   ├── pages/                           # File-based routing
│   │   ├── login.vue
│   │   ├── dashboard.vue
│   │   ├── 403.vue
│   │   └── [domain]/
│   ├── plugins/
│   │   ├── piniaPersist.client.ts       # Pinia persisted state client plugin
│   │   ├── init-user.client.ts          # Auto hydrate user dari localStorage
│   │   ├── number.ts                    # v-number input directive
│   │   └── decimal.ts                   # v-decimal input directive
│   ├── stores/                          # Pinia stores (useMy[Domain]Store)
│   │   ├── auth.ts
│   │   └── user.ts
│   └── utils/
│       ├── apiService.util.ts           # Central $fetch wrapper + auth header + 401 handler
│       ├── formatDate.ts                # Moment ID formatter
│       └── formatNumber.ts              # Localized number formatter
├── server/                              # Nitro Backend-For-Frontend (BFF)
│   ├── api/
│   │   ├── login.post.ts                # Proxy login ke backend CBT
│   │   ├── logout.delete.ts             # Proxy logout
│   │   ├── log.post.ts                  # Endpoint penerima log error client
│   │   └── [domain]/                    # Proxy CRUD endpoint ke backend CBT
│   ├── middleware/
│   │   ├── logger.ts                    # Request logging Nitro server (duration, status)
│   │   └── removeHeader.ts              # Hapus event.req.headers.host
│   └── utils/
│       ├── handleErrorApi.ts            # Sanitasi response error dari backend CBT
│       ├── logger.ts                    # Winston DailyRotateFile client
│       └── r2.ts                        # Cloudflare R2 / AWS S3 client wrapper
├── shared/                              # Nuxt 4 Shared Layer (Auto-imported di app/ & server/)
│   ├── types/                           # TypeScript DTO & domain contracts
│   │   ├── type.ts                      # typeResponse universal
│   │   ├── auth.type.ts
│   │   └── [domain].type.ts
│   └── utils/                           # Shared utility helpers & constants
│       └── constant.ts                  # App roles & constants
├── app.config.ts
├── Makefile
├── nuxt.config.ts
├── package.json
├── pm2.config.cjs
└── tsconfig.json
```

---

## 3. Implementasi Core Standar

### A. Utility Helper `cn()` (`app/lib/utils.ts`)
Standard merger class Tailwind untuk shadcn-vue:
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### B. Tipe Response Standar (`shared/types/type.ts`)
```typescript
// shared/types/type.ts
export type typeResponse = {
  code: number;
  message: string;
  data: any;
};
```

### C. Client Fetch Service (`app/utils/apiService.util.ts`)
Setiap request frontend wajib menggunakan helper ini:
1. Otomatis inject Bearer token dari `localStorage`.
2. Format response seragam `{ code, message, data }`.
3. Handle error 401: logging ke `/api/log`, clear token dari storage, redirect router ke `/`.
4. Handle error server lainnya dengan logging ke `/api/log`.

```typescript
// app/utils/apiService.util.ts
import type { typeResponse } from '#shared/types/type';

export default async (url: string, data?: any): Promise<typeResponse> => {
  const defaultResponse: typeResponse = {
    code: 200,
    message: "Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.",
    data: [],
  };

  try {
    const token = localStorage.getItem(String(useRuntimeConfig().public.token))
    if (token) {
      data = data || {}
      data.headers = {
        ...(data.headers || {}),
        Authorization: `Bearer ${token}`,
      }
    }

    const res = await $fetch<typeResponse>(url, data);

    return {
      code: 200,
      message: res.message,
      data: res.data,
    };
  } catch (error: any) {
    defaultResponse.code = error.status

    if (error.data) {
      defaultResponse.message = error.data.message;
      defaultResponse.data = error.data.data;
    }

    if (error.status === 401) {
      $fetch('/api/log', {
        method: 'POST',
        body: { level: 'error', message: `401 Unauthorized at ${url}`, url }
      }).catch(() => { });

      localStorage.removeItem(String(useRuntimeConfig().public.token))
      await useRouter().replace("/");
      return defaultResponse;
    }

    $fetch('/api/log', {
      method: 'POST',
      body: {
        level: 'error',
        message: `API Error ${error.status} at ${url}`,
        url,
        error: error.data?.message || error.message
      }
    }).catch(() => { });

    return defaultResponse;
  }
};
```

### C. Nitro BFF Error Handler (`server/utils/handleErrorApi.ts`)
```typescript
// server/utils/handleErrorApi.ts
export default function (event: any, error: any) {
  setResponseStatus(event, error.statusCode || 500)
  if (error.data) {
    return { success: false, data: error.data.data, message: error.data.message }
  }
  return { success: false, message: error.message }
}
```

### D. Nitro Sanitasi Header (`server/middleware/removeHeader.ts`)
```typescript
// server/middleware/removeHeader.ts
export default defineEventHandler(async (event) => {
  delete event.req.headers.host
})
```

### E. Winston Logger & Server Request Logger
```typescript
// server/utils/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import moment from 'moment';

const transport = new DailyRotateFile({
  filename: 'logs/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => moment().format('DD-MM-YYYY HH:mm:ss'),
    }),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...meta } = info;
      return JSON.stringify({ timestamp, level, message, ...meta });
    })
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
    }),
  ],
});
```

```typescript
// server/middleware/logger.ts
import { logger } from '../utils/logger';

export default defineEventHandler((event) => {
  const { req, res } = event.node;
  const startTime = Date.now();
  
  event.node.res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, url } = req;
    const { statusCode } = res;
    
    const logData = { method, url, statusCode, duration: `${duration}ms` };
    if (statusCode >= 400) {
      logger.error('Request Failed', logData);
    } else {
      logger.info('Request Success', logData);
    }
  });
});
```

```typescript
// server/api/log.post.ts
import { logger } from '../utils/logger';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { level = 'info', message, ...meta } = body;
  
  if (level === 'error') {
    logger.error(message, meta);
  } else {
    logger.info(message, meta);
  }
  return { success: true };
});
```

### F. User & Session Stores (`app/stores/user.ts` & `auth.ts`)
```typescript
// app/stores/user.ts
import { defineStore } from 'pinia'

export interface IUserProfile {
  username: string
  name: string
  no: string
  id: string
  role: string
  change_password: 0 | 1
  tenant_id: string
}

export const useMyUserStore = defineStore('myUserStore', {
  state: () => ({
    profile: undefined as undefined | IUserProfile
  }),
  actions: {
    setProfile(data: any) {
      this.profile = data
      if (process.client) {
        localStorage.setItem('user_profile', btoa(JSON.stringify(data)))
      }
    },
    loadFromStorage() {
      if (!process.client) return
      const data = localStorage.getItem('user_profile')
      if (!data) return
      try {
        this.profile = JSON.parse(atob(data))
      } catch (e) {
        console.error('Failed decode user profile')
        localStorage.removeItem('user_profile')
      }
    },
    clearProfile() {
      this.profile = undefined
      if (process.client) {
        localStorage.removeItem('user_profile')
      }
    }
  }
})
```

```typescript
// app/stores/auth.ts
import { defineStore } from 'pinia'
import type { IAuthLogin } from '#shared/types/auth.type'

export const useMyAuthStore = defineStore('myAuthStore', {
  actions: {
    async login(body: IAuthLogin) {
      const res: any = await apiServiceUtil('/api/login', {
        method: 'POST',
        body
      })

      if (res.code === 200) {
        localStorage.setItem(useRuntimeConfig().public.token, res.data.token)
        delete res.data.token
        useMyUserStore().setProfile(res.data)
        
        if (['teacher', 'admin'].includes(res.data.role)) {
          useRouter().push('/dashboard')
          return
        }
        useRouter().push('/siswa')
      } else {
        useToast().error({ message: res.message })
      }
    },
    async logout() {
      const res = await apiServiceUtil('/api/logout', { method: 'DELETE' })
      if (res.code === 200) {
        localStorage.removeItem(useRuntimeConfig().public.token)
        useMyUserStore().clearProfile()
        useRouter().replace('/')
        return true
      } else {
        useToast().error({ message: res.message })
        return false
      }
    }
  }
})
```

### G. Plugins Client Hydration & Directives
```typescript
// app/plugins/init-user.client.ts
export default defineNuxtPlugin(() => {
  useMyUserStore().loadFromStorage()
})
```

```typescript
// app/plugins/number.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("number", {
    beforeMount(el: HTMLInputElement) {
      el.addEventListener("input", (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value.replace(/[^0-9,\.]/g, "").replace(/^0+(?=\d)/, "");
        if (value !== target.value) {
          target.value = value;
          target.dispatchEvent(new Event("input"));
        }
      });
    },
  });
});
```

### H. Route Protection & RBAC Middleware
```typescript
// app/middleware/tokenExist.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client && !localStorage.getItem(useRuntimeConfig().public.token)) {
    return navigateTo("/")
  }
})
```

```typescript
// app/middleware/noToken.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client && localStorage.getItem(useRuntimeConfig().public.token)) {
    return navigateTo("/dashboard")
  }
})
```

```typescript
// app/middleware/roleAkses.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const userStore = useMyUserStore()
    if (!userStore.profile) {
      userStore.loadFromStorage()
    }
    const userRole = userStore.profile?.role
    const allowedRoles = to.meta.roles as string[] | undefined

    if (!allowedRoles) return
    if (!userRole || !allowedRoles.includes(userRole)) {
      return navigateTo('/403')
    }
  }
})
```

---

## 4. Template Reusable UI Components

### A. Common Button (`app/components/Common/button.vue`)
Komponen button berbasis shadcn-vue dengan `cva` dan `cn`:
```vue
<template>
  <button
    :class="cn(buttonVariants({ variant, size }), props.class, { 'opacity-70 pointer-events-none': loading })"
    :type="props.type"
    :disabled="loading"
  >
    <Icon v-if="loading" name="tabler:loader-2" class="w-4 h-4 animate-spin" />
    <Icon v-else-if="props.icon" :name="props.icon" class="w-4 h-4" />
    <span>{{ props.label }}</span>
  </button>
</template>

<script lang="ts" setup>
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700',
        destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
        outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        ghost: 'hover:bg-slate-100 hover:text-slate-900',
        success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonVariants = VariantProps<typeof buttonVariants>

const props = withDefaults(defineProps<{
  label: string
  icon?: string
  class?: string
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
}>(), {
  icon: '',
  class: '',
  type: 'button',
  loading: false,
  variant: 'default',
  size: 'sm'
})
</script>
```

### B. Common Modal (`app/components/Common/modal.vue`)
Modal dialog dengan styling shadcn, backdrop blur, dan animasi clean:
```vue
<template>
  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity" @click="!props.static && close()"></div>
    <div ref="divModal"
      :class="cn('relative z-50 flex flex-col w-full rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[calc(100svh-2rem)] overflow-hidden transition-all duration-200', {
        'max-w-lg': props.size === 'md' && !zoom,
        'max-w-3xl': props.size === 'lg' && !zoom,
        'w-full h-full max-h-none rounded-none': zoom
      })">
      <div v-if="props.closeBtn" class="sticky top-0 z-10 bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div class="flex-1">
          <h5 v-if="slot.title" class="font-semibold text-slate-900 text-base">
            <slot name="title"></slot>
          </h5>
        </div>
        <div class="flex items-center gap-1.5 ml-auto">
          <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer" @click="zoom = !zoom">
            <Icon :name="!zoom ? 'tabler:arrows-maximize' : 'tabler:arrows-minimize'" class="text-sm" />
          </button>
          <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer" @click="close">
            <Icon name="tabler:x" class="text-base" />
          </button>
        </div>
      </div>
      <div class="overflow-y-auto flex-1 p-6" :class="{ 'mb-16': slot.title }">
        <slot name="body"></slot>
      </div>
      <div v-if="slot.title" class="absolute bottom-0 left-0 right-0 px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { cn } from '~/lib/utils'

const props = defineProps({
  size: { type: String as PropType<'md' | 'lg'>, default: 'md' },
  static: { type: Boolean, default: false },
  closeBtn: { type: Boolean, default: true }
})
const emits = defineEmits(['reset'])
const slot = defineSlots()
const isModalOpen = ref(false)
const zoom = ref(false)
const divModal = ref(null)
const valid = ref()

const open = () => {
  isModalOpen.value = true
  zoom.value = false
  document.body.style.overflow = "hidden"
}
const close = () => {
  isModalOpen.value = false
  document.body.style.overflow = "auto"
  emits('reset')
  if (valid.value) valid.value.$reset()
}

defineExpose({ open, close, valid, zoom })
</script>
```

### C. Vuelidate Error Parser (`app/components/Common/message_vuelidate.vue`)
```vue
<template>
  <div v-if="props.message?.length > 0" class="flex flex-col justify-start pl-2 mt-1">
    <ul class="list-inside" :class="{ 'list-disc': props.message?.length > 1 }">
      <li v-for="(error, i) in props.message" :key="i" class="text-red-500 text-xs font-medium">
        {{ error.$message || error }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  message: { type: Array as PropType<any[]>, required: true }
})
</script>
```

### D. Modal Konfirmasi Aksi (`app/components/Card/ModalKonfirm.vue`)
```vue
<template>
  <CommonModal ref="modalRef" :static="props.static" :closeBtn="false">
    <template #body>
      <div class="py-6 px-4 flex flex-col justify-center items-center gap-3 text-center">
        <div class="p-4 rounded-2xl bg-rose-50 w-fit h-fit flex justify-center items-center relative shadow-xs border border-rose-100 mb-2">
          <Icon :name="props.icon" class="w-10 h-10" :class="props.iconClass" />
        </div>
        <h4 class="font-bold text-lg text-slate-900">{{ props.title }}</h4>
        <div v-if="slot.detail" class="w-full p-2 flex justify-center items-center">
          <slot name="detail"></slot>
        </div>
        <p class="text-sm text-slate-500 max-w-sm">{{ props.desc }}</p>
        <div class="flex gap-3 mt-4">
          <slot name="action"></slot>
        </div>
      </div>
    </template>
  </CommonModal>
</template>

<script lang="ts" setup>
const slot = defineSlots()
const props = defineProps({
  static: { type: Boolean, default: false },
  title: { type: String, required: true },
  icon: { type: String, default: 'tabler:alert-triangle' },
  iconClass: { type: String, default: 'text-rose-600' },
  desc: { type: String, required: true }
})
const modalRef = ref()
const open = () => modalRef.value?.open()
const close = () => modalRef.value?.close()
defineExpose({ open, close })
</script>
```

---

## 5. Template Modul Domain (End-to-End Implementation)

Contoh implementasi modul domain `classes`:

### Langkah 1: Definisi Type (`shared/types/class.type.ts`)
```typescript
export interface IClassCreate {
  grade_level: number
  class_name: string
}

export interface IClassTable {
  id: string
  grade_level: number
  class_name: string
}
```

### Langkah 2: Nitro BFF Proxy Endpoints (`server/api/classes/`)
```typescript
// server/api/classes/index.ts (GET & LIST)
export default defineEventHandler(async (event) => {
  try {
    return await $fetch(useRuntimeConfig().urlcbt + '/classes', {
      headers: getRequestHeaders(event) as Record<string, string>,
      query: getQuery(event),
    })
  } catch (error: any) {
    return handleErrorApi(event, error)
  }
})
```

```typescript
// server/api/classes/index.post.ts (CREATE)
export default defineEventHandler(async (event) => {
  try {
    return await $fetch(useRuntimeConfig().urlcbt + '/classes', {
      method: 'POST',
      headers: getRequestHeaders(event) as Record<string, string>,
      body: await readBody(event)
    })
  } catch (error: any) {
    return handleErrorApi(event, error)
  }
})
```

```typescript
// server/api/classes/[id].put.ts (UPDATE)
export default defineEventHandler(async (event) => {
  try {
    return await $fetch(useRuntimeConfig().urlcbt + '/classes/' + getRouterParam(event, 'id'), {
      method: 'PUT',
      headers: getRequestHeaders(event) as Record<string, string>,
      body: await readBody(event)
    })
  } catch (error: any) {
    return handleErrorApi(event, error)
  }
})
```

```typescript
// server/api/classes/[id].delete.ts (DELETE)
export default defineEventHandler(async (event) => {
  try {
    return await $fetch(useRuntimeConfig().urlcbt + '/classes/' + getRouterParam(event, 'id'), {
      method: 'DELETE',
      headers: getRequestHeaders(event) as Record<string, string>,
    })
  } catch (error: any) {
    return handleErrorApi(event, error)
  }
})
```

### Langkah 3: Pinia Store (`app/stores/class.ts`)
```typescript
import { defineStore } from 'pinia'
import type { IClassCreate } from '#shared/types/class.type'

export const useMyClassStore = defineStore('myClassStore', {
  actions: {
    async GetPaginate(query: { page: number, limit: number, search?: string }) {
      const res = await apiServiceUtil('/api/classes', {
        method: "GET",
        query
      });
      if (res.code === 200) return res.data
      useToast().error({ message: res.message })
      return undefined
    },

    async Create(body: IClassCreate) {
      const res = await apiServiceUtil('/api/classes', {
        method: "POST",
        body
      });
      if (res.code === 200) {
        useToast().success({ message: res.message })
        return true
      }
      useToast().error({ message: res.message })
      return false
    },

    async Update(id: string, body: IClassCreate) {
      const res = await apiServiceUtil('/api/classes/' + id, {
        method: "PUT",
        body
      });
      if (res.code === 200) {
        useToast().success({ message: res.message })
        return true
      }
      useToast().error({ message: res.message })
      return false
    },

    async Delete(id: string) {
      const res = await apiServiceUtil('/api/classes/' + id, {
        method: "DELETE",
      });
      if (res.code === 200) {
        useToast().success({ message: res.message })
        return true
      }
      useToast().error({ message: res.message })
      return false
    }
  }
})
```

### Langkah 4: Page CRUD View (`app/pages/kelas/daftar-kelas.vue`)
```vue
<template>
  <div class="grid gap-6">
    <CardSectionHeader>
      <template #icon>
        <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg bg-linear-to-br from-indigo-500 via-blue-500 to-cyan-500">
          <Icon name="tabler:school" class="text-xl" />
        </div>
      </template>
      <template #action>
        <div class="flex items-center gap-3">
          <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <Icon name="tabler:search" class="text-base" />
            <input type="search" v-model="search" class="text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none" placeholder="Cari nama kelas..." />
          </div>
          <CommonButton label="Tambah Kelas" icon="tabler:plus" variant="success" size="sm" @click="onOpenModalTambah" />
        </div>
      </template>
    </CardSectionHeader>

    <CommonDatatable
      title="Daftar Kelas"
      v-show="loadingTable || datas.length > 0"
      :headers="headers"
      :items-per-page="itemPage"
      :datas="datas"
      :total="totalRow"
      :current-page="currentPage"
      @items-per-page-change="changeItem"
      @page-change="changePage"
      :loading="loadingTable"
      :server-side="true"
    >
      <template #aksi="{ row: item }">
        <div class="flex items-center gap-2">
          <CardIconAction color="warning" title="Edit Kelas" icon="tabler:edit" @click="onSelectEdit(item)" />
          <CardIconAction color="alert" title="Hapus Kelas" icon="tabler:trash" @click="onSelectDelete(item)" />
        </div>
      </template>
    </CommonDatatable>

    <CardDataEmpty
      v-show="!loadingTable && datas.length === 0"
      name="Kelas"
      icon="tabler:school"
      title="Data Kelas Belum Ada"
      desc="Belum ada data kelas yang terdaftar dalam sistem."
      @create="onOpenModalTambah"
    />

    <!-- MODAL CREATE / UPDATE -->
    <CommonModal ref="modalTambah" @reset="onResetModal">
      <template #title>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Icon :name="edit ? 'tabler:edit' : 'tabler:plus'" class="text-lg" />
          </div>
          <h5 class="font-bold text-lg text-slate-800">{{ edit ? 'Edit Data Kelas' : 'Tambah Kelas Baru' }}</h5>
        </div>
      </template>
      <template #body>
        <div class="flex flex-col gap-4 mt-2">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700">Tingkat Kelas</label>
            <input v-model.number="body.grade_level" type="text" v-number class="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="Contoh: 10" />
            <CommonMessageVuelidate :message="valid.grade_level.$errors" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700">Nama Kelas</label>
            <input v-model="body.class_name" type="text" class="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="Contoh: X RPL 1" />
            <CommonMessageVuelidate :message="valid.class_name.$errors" />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-3 justify-end items-center">
          <CommonButton label="Batal" variant="ghost" size="sm" @click="modalTambah.close()" />
          <CommonButton label="Simpan" icon="tabler:device-floppy" :loading="loading" type="submit" size="sm" @click="onSubmit" />
        </div>
      </template>
    </CommonModal>

    <!-- MODAL KONFIRMASI HAPUS -->
    <CardModalKonfirm ref="modalKonfirm" title="Hapus Data Kelas!" desc="Apakah Anda yakin ingin menghapus kelas ini?">
      <template #detail>
        <p class="font-bold text-neutral">{{ selectItem?.class_name }}</p>
      </template>
      <template #action>
        <CommonButton variant="ghost" size="sm" label="Batal" @click="modalKonfirm.close()" />
        <CommonButton variant="destructive" size="sm" icon="tabler:trash" :loading="loading" label="Hapus" @click="onDelete" />
      </template>
    </CardModalKonfirm>
  </div>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { useMyClassStore } from '~/stores/class';
import type { IClassTable, IClassCreate } from '#shared/types/class.type';

definePageMeta({
  middleware: ['token-exist', 'role-akses'],
  title: 'Manajemen Kelas',
  desc: 'Kelola data rombongan belajar dan kelas',
  roles: ['admin', 'teacher']
})

const headers = [
  { columnName: "Tingkat", columnLabel: "grade_level" },
  { columnName: "Nama Kelas", columnLabel: "class_name" },
  { columnName: "Aksi", columnLabel: "aksi" },
]

const classStore = useMyClassStore()
const datas = ref<IClassTable[]>([])
const currentPage = ref(1)
const itemPage = ref(10)
const totalRow = ref(0)
const loadingTable = ref(false)
const search = ref('')

const modalTambah = ref()
const modalKonfirm = ref()
const loading = ref(false)
const edit = ref(false)
const selectItem = ref<IClassTable>()

const defaultBody: IClassCreate = { grade_level: 10, class_name: '' }
const body = ref<IClassCreate>(structuredClone(defaultBody))

const valid = useVuelidate({
  grade_level: { required: helpers.withMessage('Tingkat kelas wajib diisi', required) },
  class_name: { required: helpers.withMessage('Nama kelas wajib diisi', required) },
}, body)

onMounted(async () => {
  await getData()
  modalTambah.value.valid = valid.value
})

const getData = async () => {
  loadingTable.value = true
  const res = await classStore.GetPaginate({
    page: currentPage.value,
    limit: itemPage.value,
    search: search.value
  })
  if (res) {
    datas.value = res.data
    totalRow.value = res.total_record
  }
  loadingTable.value = false
}

const changeItem = async (val: number) => {
  itemPage.value = val
  currentPage.value = 1
  await getData()
}

const changePage = async (page: number) => {
  currentPage.value = page
  await getData()
}

const onOpenModalTambah = () => {
  body.value = structuredClone(defaultBody)
  modalTambah.value.open()
}

const onSelectEdit = (item: IClassTable) => {
  edit.value = true
  selectItem.value = item
  body.value = { grade_level: item.grade_level, class_name: item.class_name }
  modalTambah.value.open()
}

const onSelectDelete = (item: IClassTable) => {
  selectItem.value = item
  modalKonfirm.value.open()
}

const onSubmit = async () => {
  loading.value = true
  if (!(await valid.value.$validate())) {
    loading.value = false
    return
  }
  const ok = edit.value 
    ? await classStore.Update(selectItem.value!.id, body.value)
    : await classStore.Create(body.value)

  if (ok) {
    modalTambah.value.close()
    await getData()
  }
  loading.value = false
}

const onDelete = async () => {
  if (!selectItem.value) return
  loading.value = true
  if (await classStore.Delete(selectItem.value.id)) {
    modalKonfirm.value.close()
    await getData()
  }
  loading.value = false
}

const onResetModal = () => {
  selectItem.value = undefined
  edit.value = false
}
</script>
```

---

## 6. Aturan Ketat Arsitektur & Best Practices (Nuxt 4 Standard)

1. **Arsitektur 3-Layer Nuxt 4 (`app/`, `server/`, `shared/`)**:
   - `future: { compatibilityVersion: 4 }` wajib diaktifkan di `nuxt.config.ts`.
   - Kode presentasi client (pages, components, layouts, plugins, stores) wajib berada di `app/`.
   - Backend BFF (proxy endpoints, logger, S3/R2 client) wajib berada di `server/`.
   - Tipe data (TypeScript DTO) dan konstanta bersama wajib berada di `shared/` (`shared/types/`, `shared/utils/`). Import menggunakan alias `#shared/...`. Dilarang menggunakan folder `types/` manual di root.
2. **Tailwind CSS v4 CSS-First via `@tailwindcss/vite`**:
   - Gunakan plugin `@tailwindcss/vite` langsung di `vite.plugins`.
   - Konfigurasi tema warna wajib menggunakan direktif `@theme` di `app/assets/css/tailwind.css`.
   - Dilarang membuat file `tailwind.config.js` atau dependensi `@tailwindcss/postcss`.
3. **Pola BFF (Backend-For-Frontend) Wajib**:
   - Client frontend dilarang keras menembak langsung base URL backend eksternal (`URLCBT`).
   - Setiap endpoint backend wajib memiliki proxy handler di `server/api/`.
   - Client hanya memanggil endpoint lokal `/api/...` melalui `apiServiceUtil`.
4. **Pembersihan Header Host**:
   - `server/middleware/removeHeader.ts` wajib menghapus header `host` dari incoming request sebelum di-forward via `$fetch` ke backend untuk menghindari konflik SNI/virtual host reverse proxy.
5. **Form Management & Reset**:
   - Form state selalu menggunakan `ref(structuredClone(defaultBody))` agar referensi objek terisolasi.
   - Validasi wajib menggunakan `@vuelidate/core`. Reset form wajib memanggil `valid.value.$reset()`.
6. **Autentikasi & RBAC**:
   - Token disimpan di `localStorage` dengan key dari `useRuntimeConfig().public.token`.
   - Data profil di-cache di `localStorage` (`btoa(JSON.stringify(data))`) dan di-hydrate oleh plugin `init-user.client.ts`.
   - Halaman admin/guru wajib menyertakan `middleware: ['token-exist', 'role-akses']` dan array `roles: [...]` pada `definePageMeta`.
7. **Logging Standar Produksi**:
   - Nitro logger mencatat durasi request dan status code ke daily rotate file di folder `logs/`.
   - Error 401 dan API failure di frontend otomatis dikirimkan ke `/api/log` secara asinkron tanpa memblokir UI thread.
8. **Komponen UI shadcn-vue & Utility `cn()`**:
   - Seluruh komponen UI visual wajib menggunakan shadcn-vue / Radix Vue primitives dengan token Tailwind CSS v4.
   - Dilarang memakai styling DaisyUI (`btn`, `fieldset`, `input-bordered`). Gunakan utility `cn(...)` dan `cva` untuk mengatur varian komponen.
   - Komponen atomik disimpan rapi di `app/components/ui/`.
9. **Pemisahan Endpoint Pagination vs All (Dropdown Wajib Path `/all`)**:
   - Komponen dropdown pilihan, `<Select>`, combobox, atau picker form **DILARANG KERAS** memanggil endpoint paginasi (`limit=...`).
   - Dropdown/picker **WAJIB** memanggil endpoint backend berakhiran `/all` (contoh: `apiServiceUtil('/api/classes/all')`).
   - Format respons deterministik (1 endpoint = 1 format): Endpoint `/all` mengembalikan array data murni tanpa metadata pagination (`res.data = []`), sedangkan endpoint tabel paginasi selalu mengembalikan objek `{ items, pagination }`. Dilarang mengubah struktur respons secara kondisional via query parameter.
10. **Aturan Dokumentasi Komentar Kode (Bahasa Indonesia)**:
    - **Wajib di Seluruh File Kode**: Setiap berkas kode tanpa terkecuali (baik di level `app/` [pages, components, stores, plugins, middleware, utils, layouts], `server/` [api BFF proxy, middleware, utils], maupun `shared/` [types, utils]) **WAJIB** diberikan komentar penjelasan alur dan tujuannya dalam **Bahasa Indonesia**.
    - Berikan komentar bertahap pada setiap fungsi, state management, event handler, dan pemanggilan API (contoh: `// 1. Validasi input form`, `// 2. Kirim payload ke BFF`, `// 3. Tampilkan toast notifikasi`).
    - Nama variabel, fungsi, props, interface, dan sintaks kode tetap menggunakan Bahasa Inggris baku.
