# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**排班長條圖 (Shift Planning Bar Chart)** - A React-based employee scheduling visualization tool for restaurant/hospitality environments. Displays employee work and break schedules from 10:00 AM to 11:00 PM in a horizontal timeline chart with role-based color coding.

**Tech Stack:** React 18.3.1, TypeScript 5.9.3, Vite 5.2.0, react-hook-form 7.51.4

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173, auto-opens browser)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
```

**Node Version:** 18+ required (Vite 5 dependency)

## Architecture Overview

### Component Structure

```
App.tsx (State Container)
├── EditScheduling.tsx (Form Component)
│   └── react-hook-form with validation
└── SchedulingChart.tsx (Visualization)
    ├── Timeline grid (26 half-hour slots: 10:00-22:30)
    ├── Employee rows with edit/delete actions
    └── Work hours summary and role legend
```

### State Management

**Centralized in App.tsx:**
- `employees: Employee[]` - Schedule data
- `roleColors: Record<string, string>` - Dynamic role-to-color mapping
- `paletteIndex: number` - Tracks next available color from COLOR_PALETTE
- `editingId: string | null` - Currently editing employee ID

**Form state:** Managed by react-hook-form with onChange validation mode.

### Data Flow

1. **Add/Edit:** Form submission → App validates → Assigns colors (ROLE_COLOR_OVERRIDES or COLOR_PALETTE) → Updates state → Resets form
2. **Delete:** Chart triggers handler → App removes employee → Cleans up unused roleColors
3. **Color assignment:**
   - Priority 1: Check ROLE_COLOR_OVERRIDES (predefined colors for specific roles)
   - Priority 2: Reuse existing roleColors[role] if already assigned
   - Priority 3: Assign next COLOR_PALETTE[paletteIndex % 15]
4. **Chart rendering:** Iterates TIME_SLOTS (26 × 0.5hr slots), determines cell status (off/work/break), applies CSS custom properties for colors

## Key File Locations

### Core Application
- `src/App.tsx` - Main logic, state management, form handling, color assignment
- `src/components/EditScheduling/EditScheduling.tsx` - Form component with role selection (客服, 菜口, 跑菜, 內場, 外場)
- `src/components/Scheduling/SchedulingChart.tsx` - Timeline chart visualization with edit/delete actions

### Type Definitions
- `src/components/types.ts` - TypeScript interfaces:
  - `Employee` - Internal data structure (uses decimal hours: 10.5 = 10:30)
  - `EmployeeFormValues` - Form data structure (uses string format "HH:mm")

### Configuration & Utilities
- `src/components/constants.ts` - Key constants:
  - `WORK_START = 10`, `WORK_END = 23` (10:00 AM to 11:00 PM)
  - `SLOT_STEP = 0.5` (30-minute increments)
  - `COLOR_PALETTE` - 15 predefined colors for roles
  - `ROLE_COLOR_OVERRIDES` - Hardcoded colors for specific roles
  - `FROM_REGISTER_NAME` - Form field name constants
- `src/components/utils.ts` - Utility functions:
  - `toHourFloat()` / `toTimeInputValue()` - Convert between decimal and "HH:mm" formats
  - `isHalfHour()` - Validate :00 or :30 minutes only
  - `calculateWorkHours()` - Compute duration minus breaks
  - `overlaps()` - Check time range overlap
  - `TIME_SLOTS` - Precomputed array of 26 time slots (10.0 to 22.5)

### Styles
- `src/index.css` - Global styles (app layout, form, chart grid, legend, responsive breakpoints)
- `src/components/EditScheduling/EditScheduling.module.css` - Scoped form styles
- **CSS Module Import Pattern:** `import styles from "./Component.module.css"`
- **Type Declaration:** `src/vite-env.d.ts` includes CSS Module type declarations

### Build Configuration
- `vite.config.ts` - Dev server on port 5173, auto-open browser, React plugin with Fast Refresh
- `tsconfig.json` - Strict mode, ES2020 target, Bundler module resolution

## Critical Patterns & Conventions

### Time Representation
- **Internal storage:** Decimal hours (e.g., 10.5 = 10:30 AM, 14.0 = 2:00 PM)
- **Form inputs:** String format "HH:mm"
- **Conversion:** Use `toHourFloat()` and `toTimeInputValue()` utilities
- **Validation:** Only :00 or :30 minutes allowed (half-hour increments)

### Color Management
1. Check `ROLE_COLOR_OVERRIDES[role]` first (hardcoded)
2. Reuse `roleColors[role]` if previously assigned
3. Assign next from `COLOR_PALETTE` using `paletteIndex`
4. **Cleanup:** When employee deleted/edited, remove unused role colors to recycle palette

### Form Handling with react-hook-form
- Use `register()` for input binding with validation rules
- `handleSubmit(onSubmit)` for form submission
- `reset()` to clear form or populate for editing
- `control` + `useWatch()` for reactive values
- `setError()` / `clearErrors()` for custom validation messages
- Validation mode: "onChange" for real-time feedback

### Chart Rendering Strategy
- **Grid Layout:** Dynamic columns based on TIME_SLOTS.length (26 slots)
- **Cell Status Logic:** For each slot, determine:
  - "off" - outside employee's shift
  - "work" - within shift, not on break
  - "break" - within break period
- **Overlap Detection:** `overlaps(startA, endA, startB, endB)` returns true if `max(startA, startB) < min(endA, endB)`
- **Styling:** Status-based CSS classes (`.chart__cell--work`, `.chart__cell--break`, `.chart__cell--off`)
- **Break Visualization:** CSS `repeating-linear-gradient` for diagonal stripes
- **Dynamic Colors:** CSS custom property `--cell-color` set per cell

### CSS Module Pattern
- Component-specific styles use `.module.css` suffix
- Import: `import styles from "./Component.module.css"`
- Usage: `className={styles.className}`
- Global styles in `src/index.css` with BEM-like naming

### TypeScript
- Strict mode enabled (all type checks enforced)
- Props explicitly typed with interfaces
- Separate types for form values vs internal data
- CSS Module declarations in `src/vite-env.d.ts`

## Important Constraints & Gotchas

### Business Rules
- **Max Employees:** 15 (enforced in App.tsx, tied to COLOR_PALETTE size)
- **Time Range:** 10:00-23:00 only (WORK_START to WORK_END)
- **Time Increments:** Half-hour only (:00 or :30 minutes)
- **Break Validation:** Break times must be within shift times

### Technical Details
- **ID Generation:** `${Date.now()}-${Math.random().toString(16).slice(2)}` (client-side only, not cryptographically secure)
- **Form Reset on Edit:** Must convert decimal hours back to "HH:mm" format; null break times → empty strings
- **Chart Width:** Fixed cell width (72px) × 26 slots = ~1872px minimum, requires horizontal scroll on smaller screens
- **Sticky Headers:** Chart uses `position: sticky` with z-index layering for context during scroll

### Known Issues
- **Duplicate Form Fields:** EditScheduling.tsx has two shift sections ("第一段班", "第二段班") that currently bind to the same form fields - this appears to be incomplete multi-shift functionality

## Development Workflow

### Adding New Features
1. Update types in `src/components/types.ts` if data structure changes
2. Modify constants in `src/components/constants.ts` for configuration changes
3. Add utilities to `src/components/utils.ts` for reusable logic
4. Update components following existing patterns
5. Test with `npm run dev` (hot reload enabled)

### Styling Approach
- Global/shared styles → `src/index.css`
- Component-specific styles → `ComponentName.module.css`
- Use CSS custom properties for dynamic theming (e.g., `--cell-color`)
- Responsive breakpoints: 1024px (tablet), 640px (mobile)

### Commit Style
- Conventional Commits encouraged: `feat:`, `fix:`, `refactor:`
- Recent examples:
  - `feat: enhance SchedulingChart with role color overrides and improve error handling`
  - `refactor: migrate to TypeScript, update file extensions and add tsconfig`
  - `feat: add react-hook-form for form handling in App component`

## Environment & Configuration

### Environment Variables
- `.env.example` suggests future Supabase integration (not currently implemented)
- Vite exposes variables prefixed with `VITE_` to client code
- `.env` file exists but is gitignored

### Git Workflow
- Main branch: `master`
- `dist/` directory excluded from commits (generated by build)
- No linting/formatting tools configured yet - match existing code style

## Unique Architectural Decisions

1. **Decimal Hour Storage:** Times stored as floats (10.5) instead of Date objects
   - Simplifies arithmetic for duration calculations
   - Requires conversion utilities for form display

2. **Color Recycling:** Unused role colors removed from roleColors map
   - Optimizes palette usage when employees deleted
   - Prevents running out of distinct colors with 15-color limit

3. **CSS Custom Properties for Dynamic Colors:** Using `--cell-color` CSS variable
   - Enables dynamic theming without inline styles
   - Works with both solid backgrounds and gradient patterns

4. **Two-Phase State Updates:** Form submission validates → assigns colors → updates state → resets form
   - Ensures data consistency before state mutation
   - Prevents partial updates on validation failure

## Testing

**Current Status:** No testing framework configured

**Recommended Setup (per AGENTS.md):**
- Vitest + React Testing Library
- Test location: `src/__tests__/`
- Naming: `*.test.tsx`
- Focus: Component rendering, props validation, user interactions

## Future Enhancement Areas

Based on code structure and environment templates:
- Backend integration (Supabase variables in .env.example)
- Multi-shift support per employee (duplicate form sections hint at this)
- User-configurable role options (currently hardcoded)
- Export/print functionality for schedules
- Multi-day calendar view (currently single-day only)
