# UI Library (@microfrontend/ui)

Shared Design System and reusable Standalone Angular UI components for all Micro-Frontends.

## Architecture & Folder Structure

```text
libs/ui/
├── src/
│   ├── index.ts                            # Barrel exports for @microfrontend/ui
│   └── lib/
│       ├── components/                     # Standalone UI Components
│       │   ├── badge/                      # Badge component & variants
│       │   ├── card/                       # Card container component
│       │   └── spinner/                    # Loading spinner component
│       │
│       └── styles/                         # Global Design Tokens & Scss styles
│           ├── _variables.scss             # Color Palette, Typography & Spacing Tokens
│           ├── _mixins.scss                # Responsive & Utility Mixins
│           └── index.scss                  # Core UI Styles Barrel
```

## Available Components

### 1. `BadgeComponent` (`<ui-badge>`)
Display status indicators, tags, or count pills.

- **Props**:
  - `type`: `'primary' | 'success' | 'warning' | 'danger' | 'info'` (default: `'primary'`)
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
  - `rounded`: `boolean` (default: `false`)

**Usage**:
```html
<ui-badge type="success">Active</ui-badge>
<ui-badge type="danger" [rounded]="true">3 Unread</ui-badge>
```

---

### 2. `CardComponent` (`<ui-card>`)
Surface container for grouping related content and actions.

- **Props**:
  - `title`: `string` (Optional card header title)
  - `subtitle`: `string` (Optional card header subtitle)
  - `shadow`: `'none' | 'sm' | 'md' | 'lg'` (default: `'sm'`)
  - `bordered`: `boolean` (default: `true`)

**Usage**:
```html
<ui-card title="User Statistics" subtitle="Real-time telemetry data" shadow="md">
  <p>Card body content goes here...</p>
</ui-card>
```

---

### 3. `SpinnerComponent` (`<ui-spinner>`)
Accessible, animated loading spinner for async operations.

- **Props**:
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
  - `color`: `'primary' | 'white' | 'secondary'` (default: `'primary'`)

**Usage**:
```html
<ui-spinner size="md" color="primary"></ui-spinner>
```

---

## Public Export Import Guide

Import standalone UI components directly into Angular standalone component `imports`:

```ts
import { Component } from '@angular/core';
import { BadgeComponent, CardComponent, SpinnerComponent } from '@microfrontend/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardComponent, BadgeComponent, SpinnerComponent],
  template: `
    <ui-card title="Analytics Overview">
      <ui-badge type="success">Live</ui-badge>
    </ui-card>
  `
})
export class DashboardComponent {}
```

## SCSS Styles & Tokens

To import global design system variables or mixins into your MFE styles:

```scss
@use '@microfrontend/ui/styles/variables' as tokens;
@use '@microfrontend/ui/styles/mixins' as mixins;

.custom-box {
  background-color: tokens.$primary-color;
  @include mixins.flex-center;
}
```
