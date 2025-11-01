# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**排班長條圖 (Shift Planning Bar Chart)** - A React-based employee scheduling visualization tool for restaurant/hospitality environments. Employees can have up to two independent shifts per day, each with different roles and time periods. The system displays schedules from 10:00 AM to 11:00 PM in a horizontal timeline chart with role-based color coding.

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
│   ├── Two shift sections (第一段班, 第二段班)
│   └── react-hook-form with onChange validation
└── SchedulingChart.tsx (Visualization)
    ├── Timeline grid (26 half-hour slots: 10:00-22:30)
    ├── Employee rows with icon-based edit/delete actions
    └── Work hours summary and role legend
```

### State Management

**Centralized in App.tsx:**
- `employees: Employee[]` - Schedule data with dual-shift support
- `editingId: string | null` - Currently editing employee ID

**Form state:** Managed by react-hook-form with onChange validation mode.

**Color Management:** Static colors from `ROLE_COLOR_OVERRIDES` only (no dynamic assignment).

### Data Flow

1. **Add/Edit:** Form submission → App validates both shifts → Creates Employee with shift1/shift2 → Updates state → Resets form
2. **Delete:** Chart triggers handler → App removes employee from state
3. **Shift Validation Logic:**
   - **Key principle:** Only validate based on whether a role is selected
   - If shift1/shift2 role is empty → ignore that shift entirely (even if time fields have default values)
   - If shift1/shift2 role is selected → validate that all time fields are complete
   - At least one shift must have a role selected
4. **Chart rendering:** For each employee, renders both shifts with their respective role colors; determines cell status (off/work) based on overlapping time ranges

## Key File Locations

### Core Application
- `src/App.tsx` - Main logic, state management, dual-shift form handling
- `src/components/EditScheduling/EditScheduling.tsx` - Two-shift form with role selection (客服, 菜口, 跑菜, 內場, 外場)
- `src/components/Scheduling/SchedulingChart.tsx` - Timeline chart with SVG icon buttons for edit/delete

### Type Definitions
- `src/components/types.ts` - TypeScript interfaces:
  - `Shift` - Single shift: `{ role: string; shiftStart: number; shiftEnd: number }`
  - `Employee` - Person with two nullable shifts: `{ id, name, shift1: Shift | null, shift2: Shift | null }`
  - `EmployeeFormValues` - Form fields: 6 shift fields (shift1Role, shift1Start, shift1End, shift2Role, shift2Start, shift2End)

### Configuration & Utilities
- `src/components/constants.ts` - Key constants:
  - `WORK_START = 10`, `WORK_END = 23` (10:00 AM to 11:00 PM)
  - `SLOT_STEP = 0.5` (30-minute increments)
  - `ROLE_COLOR_OVERRIDES` - Static colors for 5 roles (客服, 菜口, 跑菜, 內場, 外場)
  - `FROM_REGISTER_NAME` - Form field constants for shift1/shift2
- `src/components/utils.ts` - Utility functions:
  - `toHourFloat()` / `toTimeInputValue()` - Convert between decimal and "HH:mm" formats
  - `isHalfHour()` - Validate :00 or :30 minutes only
  - `calculateWorkHours()` - Sum hours from shift1 + shift2
  - `overlaps()` - **CRITICAL:** Returns true if `endA === startB` (boundary case) OR `max(startA, startB) < min(endA, endB)`
  - `TIME_SLOTS` - Precomputed array of 26 time slots (10.0 to 22.5)

### Styles
- `src/index.css` - Global styles (app layout, form, chart grid, legend, responsive breakpoints)
- `src/components/EditScheduling/EditScheduling.module.css` - Scoped form styles (formLayerTitle for shift section headers)
- **CSS Module Import Pattern:** `import styles from "./Component.module.css"`
- **Type Declaration:** `src/vite-env.d.ts` includes CSS Module type declarations

### Build Configuration
- `vite.config.ts` - Dev server on port 5173, auto-open browser, React plugin with Fast Refresh
- `tsconfig.json` - Strict mode, ES2020 target, Bundler module resolution

## Critical Patterns & Conventions

### Dual-Shift System

**Key Design:**
- Each employee can have 0, 1, or 2 independent shifts
- Each shift has its own role and time range
- Shifts are distinguished by role selection, not time values

**Form Field Default Values:**
- Shift 1 times: 10:00-14:00
- Shift 2 times: 17:00-21:00
- **Important:** Time defaults exist, but shift is only "active" if role is selected

**Validation Logic:**
```typescript
// Shift 1
const hasShift1Role = form.shift1Role && form.shift1Role.trim() !== "";
if (hasShift1Role) {
  // Validate shift1Start and shift1End are complete
}

// Shift 2
const hasShift2Role = form.shift2Role && form.shift2Role.trim() !== "";
if (hasShift2Role) {
  // Validate shift2Start and shift2End are complete
}

// At least one shift must have a role
if (!hasShift1Role && !hasShift2Role) {
  setError("root", { message: "至少需要選擇一段班次的工作項目。" });
}
```

### Time Representation
- **Internal storage:** Decimal hours (e.g., 10.5 = 10:30 AM, 14.0 = 2:00 PM)
- **Form inputs:** String format "HH:mm"
- **Conversion:** Use `toHourFloat()` and `toTimeInputValue()` utilities
- **Validation:** Only :00 or :30 minutes allowed (half-hour increments)

### Time Slot Boundary Handling

**Critical Issue Fixed:**
The `overlaps()` function must handle the boundary case where a shift ends exactly at a time slot boundary.

```typescript
// Example: Shift 10:00-14:00 should include the 13:30-14:00 time slot
export const overlaps = (startA: number, endA: number, startB: number, endB: number): boolean => {
  if (endA === startB) {
    return true;  // Boundary case: shift end equals slot start
  }
  return Math.max(startA, startB) < Math.min(endA, endB);
};
```

Without the boundary check, slots at the exact end time (e.g., 13:30-14:00 for a 10:00-14:00 shift) would incorrectly show as "off" instead of "work".

### Color Management

**Simplified Static Approach:**
- All colors come from `ROLE_COLOR_OVERRIDES` constant
- No dynamic color assignment or recycling
- Each role always has the same color
- Chart looks up color directly: `ROLE_COLOR_OVERRIDES[shift.role]`

### Form Handling with react-hook-form
- Use `register()` for input binding with validation rules
- `handleSubmit(onSubmit)` for form submission
- `reset()` with explicit default values to clear form after submit/edit
- `control` + `useWatch()` for reactive form values (watch shift times for display)
- `setError()` / `clearErrors()` for custom validation messages
- Validation mode: "onChange" for real-time feedback

### Chart Rendering Strategy
- **Grid Layout:** Dynamic columns based on TIME_SLOTS.length (26 slots)
- **Cell Status Logic:** For each slot, check both shift1 and shift2:
  - If overlaps with shift1 → return `{ status: "work", role: shift1.role }`
  - Else if overlaps with shift2 → return `{ status: "work", role: shift2.role }`
  - Else → return `{ status: "off" }`
- **Styling:** Status-based CSS classes (`.chart__cell--work`, `.chart__cell--off`)
- **Dynamic Colors:** CSS custom property `--cell-color` set to `ROLE_COLOR_OVERRIDES[cellData.role]`
- **Icon Buttons:** Edit/delete use inline SVG icons (pencil and trash) with hover effects

### CSS Module Pattern
- Component-specific styles use `.module.css` suffix
- Import: `import styles from "./Component.module.css"`
- Usage: `className={styles.className}`
- Global styles in `src/index.css` with BEM-like naming

### TypeScript
- Strict mode enabled (all type checks enforced)
- Props explicitly typed with interfaces
- Separate types for form values (`EmployeeFormValues`) vs internal data (`Employee`, `Shift`)
- CSS Module declarations in `src/vite-env.d.ts`

## Important Constraints & Gotchas

### Business Rules
- **Max Employees:** 15 (enforced in App.tsx)
- **Time Range:** 10:00-23:00 only (WORK_START to WORK_END)
- **Time Increments:** Half-hour only (:00 or :30 minutes)
- **Shift Independence:** Each shift can have different role and time range
- **Validation Trigger:** Shift is only validated if its role field is non-empty

### Technical Details
- **ID Generation:** `${Date.now()}-${Math.random().toString(16).slice(2)}` (client-side only, not cryptographically secure)
- **Form Reset on Edit:** Must convert decimal hours back to "HH:mm" format; null shifts → empty role strings
- **Chart Width:** Fixed cell width (72px) × 26 slots = ~1872px minimum, requires horizontal scroll on smaller screens
- **Sticky Headers:** Chart uses `position: sticky` with z-index layering for context during scroll
- **Boundary Edge Case:** The `overlaps()` function includes special handling for `endA === startB` to ensure slots at shift boundaries display correctly

### Work Hours Calculation

No break times - all time within shifts counts as work:
```typescript
let total = 0;
if (employee.shift1) {
  total += employee.shift1.shiftEnd - employee.shift1.shiftStart;
}
if (employee.shift2) {
  total += employee.shift2.shiftEnd - employee.shift2.shiftStart;
}
return total;  // Sum of both shifts
```

## Development Workflow

### Adding New Features
1. Update types in `src/components/types.ts` if data structure changes
2. Modify constants in `src/components/constants.ts` for configuration changes
3. Add utilities to `src/components/utils.ts` for reusable logic
4. Update components following existing dual-shift pattern
5. Test with `npm run dev` (hot reload enabled)

### Styling Approach
- Global/shared styles → `src/index.css`
- Component-specific styles → `ComponentName.module.css`
- Use CSS custom properties for dynamic theming (e.g., `--cell-color`)
- Responsive breakpoints: 1024px (tablet), 640px (mobile)
- Icon buttons: 28×28px with 6px border-radius, SVG icons 16×16px

### Commit Style
- Conventional Commits encouraged: `feat:`, `fix:`, `refactor:`
- Recent examples:
  - `feat: implement dual-shift system with independent role and time selection`
  - `fix: resolve time slot boundary issue in overlaps function`
  - `refactor: replace text buttons with SVG icon buttons in chart`

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

1. **Dual Independent Shifts:** Each employee supports two separate shifts with different roles
   - Simplifies scheduling for split-shift workers (e.g., lunch and dinner service)
   - Validation based on role selection, not time field presence

2. **Decimal Hour Storage:** Times stored as floats (10.5) instead of Date objects
   - Simplifies arithmetic for duration calculations
   - Requires conversion utilities for form display

3. **Role-Based Validation Trigger:** Time fields have default values, but shifts are only validated if role is selected
   - Allows users to ignore shift2 by leaving role empty
   - Prevents validation errors from default time values

4. **Static Color Mapping:** Direct lookup from `ROLE_COLOR_OVERRIDES` constant
   - Simpler than dynamic color assignment
   - No need for color recycling or palette management
   - Consistent colors across sessions

5. **Boundary-Aware Overlap Detection:** Special case for `endA === startB` in overlaps()
   - Ensures time slots at exact shift boundaries display correctly
   - Prevents "missing half-hour" display bug

6. **Icon-Only Action Buttons:** Edit/delete use SVG icons without text labels
   - Saves horizontal space in chart rows
   - `title` and `aria-label` attributes provide accessibility
   - Hover effects indicate interactivity

## Testing

**Current Status:** No testing framework configured

**Recommended Setup (per AGENTS.md):**
- Vitest + React Testing Library
- Test location: `src/__tests__/`
- Naming: `*.test.tsx`
- Focus: Dual-shift validation logic, time boundary cases, form state management
