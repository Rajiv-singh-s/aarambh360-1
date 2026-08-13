# Aarambh360 Monorepo

Enterprise-grade full-stack platform for UPSC preparation, featuring an AI-assisted Mains evaluation engine, structured NCERT/Standard curriculum reader, adaptive MCQ test series, and admin content management system.

---

## 🏗️ Architecture Overview

The repository is organized as a high-performance monorepo powered by **Turborepo** and **pnpm workspaces**:

```plaintext
aarambh360/
├── apps/
│   ├── mobile/         # React Native + Expo mobile application (Aarambh360 app)
│   ├── backend/        # NestJS REST API server (PostgreSQL + Prisma + Firebase Auth)
│   └── admin/          # Next.js CMS admin dashboard for editorial content management
├── packages/
│   └── types/          # Shared TypeScript type definitions and API contracts (@aarambh360/types)
├── docs/               # Technical specifications, migration plans, and gap analyses
├── pnpm-workspace.yaml  # Workspace directory definition
├── turbo.json          # Turborepo task pipeline orchestration
└── package.json        # Root scripts & tooling dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v22.x` (LTS recommended)
- **pnpm**: `v11.6.0` (`npm install -g pnpm@11.6.0` or `corepack enable`)

### Installation

Install all workspace dependencies:
```bash
pnpm install
```

---

## 🛠️ Monorepo Commands

All commands are orchestrated through Turborepo across all apps and packages:

| Command | Description |
|---|---|
| `pnpm dev` | Run all applications (`mobile`, `backend`, `admin`) in development mode in parallel. |
| `pnpm build` | Build all packages and applications in topological dependency order. |
| `pnpm lint` | Run ESLint across all workspace packages. |
| `pnpm typecheck` | Run TypeScript type checking (`tsc --noEmit`) across the entire repository. |
| `pnpm clean` | Clean build artifacts and cached outputs across all packages. |

### Targeted Workspace Commands

Run commands on a specific app or package using the `--filter` flag:

```bash
# Start only the NestJS backend
pnpm --filter @aarambh360/backend dev

# Build only the Next.js admin portal
pnpm --filter @aarambh360/admin build

# Start the Expo mobile app
pnpm --filter @aarambh360/mobile dev

# Typecheck shared types package
pnpm --filter @aarambh360/types typecheck
```

---

## 📦 Packages & Applications

- [`apps/mobile`](./apps/mobile): React Native cross-platform mobile application built on Expo SDK 54, React Navigation 7, and custom theme tokens.
- [`apps/backend`](./apps/backend): Modular Monolith backend written in NestJS, utilizing PostgreSQL, Prisma ORM, Firebase Admin token verification, and AI rubric evaluation workflows.
- [`apps/admin`](./apps/admin): Internal content management portal built on Next.js 15 App Router and TailwindCSS.
- [`packages/types`](./packages/types): Pure TypeScript package defining shared DTOs, API contracts, and environment configurations.

---

## 🔒 Security & Environment Variables

- Never commit `.env` or secret keys. Refer to `.env.example` in respective apps for required environment variables.
- Legacy prototype files are preserved in `legacy-Aarambh360/` for reference and must not be imported into production workspace packages.
