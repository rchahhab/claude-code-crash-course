# UI Coding Standards

These rules apply to all UI code in this project.

## The Rule

**Only shadcn/ui components may be used for the UI. Do not create custom UI components.**

If the UI needs something, find the matching shadcn/ui component and use it. If no shadcn/ui component fits, change the design to use ones that do. Do not build a replacement.

## What this means in practice

- Build every screen by composing shadcn/ui components (`Button`, `Calendar`, `Popover`, `Card`, `Input`, `Table`, etc.).
- Do **not** create new component files for UI (for example `MealCard.tsx` or `DatePicker.tsx`), and do not wrap shadcn/ui components in custom ones.
- Do **not** use raw HTML form controls (`<input>`, `<button>`, `<select>`, `<textarea>`) where a shadcn/ui component exists. Use `Input`, `Button`, `Select`, `Textarea`, and so on.
- Do **not** pull in other UI libraries (MUI, Chakra, Radix primitives used directly, etc.).
- Pages may lay out shadcn/ui components with Tailwind utility classes (flex, grid, spacing, typography). Do not use that to restyle a component into something new.

## Adding components

Components live in `src/components/ui/` and are installed with the shadcn CLI, not written by hand:

```bash
npx shadcn@latest add <component>
```

- Project config is in `components.json` (style `base-nova`, base color `neutral`, icons from `lucide-react`).
- Import with the alias, for example `import { Button } from "@/components/ui/button"`.
- Do not hand-edit the generated files in `src/components/ui/`. To change a component, re-run the CLI or adjust theme tokens in `src/app/globals.css`.
- Use `lucide-react` for icons.

## Styling

- Use the theme tokens from `src/app/globals.css` (`bg-background`, `text-muted-foreground`, `border-input`, and so on). Do not hard-code colors.
- Use the `cn()` helper from `@/lib/utils` to merge class names.
- Support both light and dark mode through the tokens.

## Date selection

Pick dates with the shadcn/ui `Calendar` inside a `Popover`, triggered by a `Button`. Do not use a native `<input type="date">`.

## Server vs. client

Pages are Server Components by default. Interactive shadcn/ui usage that needs state or handlers (for example a date picker) goes in a `"use client"` file, which should contain only the composition of shadcn/ui components and the handler logic.

## Before merging

- [ ] No raw form controls where a shadcn/ui component exists
- [ ] No new custom UI components or wrappers
- [ ] Any new shadcn/ui component was added with the CLI
- [ ] `npm run lint` passes
