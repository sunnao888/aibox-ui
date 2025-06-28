# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue.js monorepo based on vue-vben-admin v5, implementing the "芋道(YuDao)" enterprise administrative platform. It's a comprehensive Chinese enterprise-grade backend management system with extensive business modules.

## Development Commands

### Prerequisites
- Node.js >= 20.10.0  
- pnpm >= 10.10.0 (enforced via preinstall hook)

### Common Development Tasks

```bash
# Start development server
pnpm dev:antd                    # Start main Ant Design Vue application
pnpm dev                         # Interactive mode to choose which app to start

# Build commands
pnpm build:antd                  # Build main application
pnpm build                       # Build all applications
pnpm build:analyze               # Build with bundle analysis

# Quality assurance (run these before committing)
pnpm check                       # Run all checks (circular deps, unused deps, types, spelling)
pnpm lint                        # Run ESLint
pnpm format                      # Format code with Prettier
pnpm check:type                  # TypeScript type checking

# Testing
pnpm test:unit                   # Run Vitest unit tests
pnpm test:e2e                    # Run Playwright end-to-end tests

# Maintenance
pnpm reinstall                   # Clean install (removes all node_modules)
pnpm clean                       # Clean build artifacts
```

## Architecture Overview

### Monorepo Structure

**Main Application**: `/apps/web-antd` - Complete Ant Design Vue admin dashboard with authentication, routing, and business modules

**Shared Packages** (`/packages`):
- `/@core/base/shared` - Core utilities, constants, store management
- `/@core/ui-kit` - Reusable UI components (forms, layouts, menus, popups)
- `/locales` - Internationalization support
- `/stores` - Pinia store modules
- `/styles` - Shared styling and design tokens
- `/utils` - Utility functions and helpers

**Development Tools** (`/internal`):
- Shared configurations for ESLint, Prettier, Stylelint, TypeScript, Tailwind, Vite
- `node-utils` - Development scripts and utilities

**Build System**:
- **Turbo** for monorepo orchestration and caching
- **Vite 6+** for development and building
- **pnpm workspaces** for package management

### Key Technologies

- **Frontend**: Vue 3.5.13 + TypeScript 5.8.3 + Vite 6.3.4
- **UI Framework**: Ant Design Vue 4.2.6 + Tailwind CSS 3.4.17
- **State Management**: Pinia 3.0.2
- **Routing**: Vue Router 4.5.1
- **Internationalization**: Vue i18n 11.1.3
- **Form Handling**: VeeValidate + Zod
- **HTTP Client**: Axios 1.9.0
- **Rich Text**: TinyMCE 6.1.0
- **Charts**: ECharts 5.6.0
- **Data Tables**: VXE Table 4.13.16

### Business Modules

The main application includes comprehensive business functionality:
- **System Management**: Users, roles, permissions, departments, menus
- **Infrastructure**: API logs, code generation, file management, scheduled jobs  
- **Workflow**: BPMN workflow engine with approval processes
- **Payment**: Multi-channel payment integration
- **CRM/ERP**: Customer relationship and enterprise resource planning
- **E-commerce**: Complete mall system with products, orders, promotions
- **Reporting**: Data visualization and report generation
- **AI Integration**: Large language model capabilities

### Code Organization

**Component Structure**: Follow existing patterns in `/packages/@core/ui-kit` for new UI components

**API Integration**: Use the service layer pattern found in `/apps/web-antd/src/api/`

**Store Management**: Pinia stores are organized by feature in `/packages/stores/`

**Styling**: Use Tailwind classes and design tokens from `/packages/styles/`

**Routing**: Dynamic routes are generated based on permissions, see `/apps/web-antd/src/router/`

### Testing

- **Unit Tests**: Vitest with Vue Testing Library (files ending in `.test.ts`)
- **E2E Tests**: Playwright configuration in `/playground/playwright.config.ts`
- **Test Coverage**: Focus on core utilities and business logic

### Code Quality

The project enforces code quality through:
- **Lefthook git hooks**: Auto-formatting and linting on commit
- **ESLint + Prettier**: Code style consistency  
- **TypeScript**: Type safety throughout
- **Commitlint**: Conventional commit message format

### Internationalization

The application supports Chinese and English. Add new translations to `/packages/locales/`. Use the existing i18n composables for component translations.

### Performance Considerations

- **Dynamic imports**: Use for route-based code splitting
- **Component lazy loading**: Large components should be lazy-loaded
- **Bundle analysis**: Use `pnpm build:analyze` to check bundle sizes
- **Caching**: Turbo handles build caching across the monorepo