---
name: test-engineer
description: Standardized workflow for writing, running, and debugging tests in this project.
---

# Test Engineer Skill

This skill guides the agent in writing robust tests. "Spec-Driven Development" (from the `spec-kit` skill) essentially requires testing to verify that specs are met.

## Testing Stack
-   **Unit/Component**: Vitest + Vue Test Utils
-   **E2E**: Playwright (if configured) or manual verification instructions.

## Workflow

### 1. Identify Test Scope
Before coding, determine what needs testing:
-   **Critical Paths**: Login, Payment, Key Feature Flows.
-   **Edge Cases**: Empty states, Error states, Network failures.
-   **Utilities**: Helper functions (e.g., date formatting, calculation logic).

### 2. Write Tests (TDD Preferred)
Write the test *before* or *immediately along with* the implementation.

#### Component Test Template (`src/components/__tests__/Example.spec.js`)
```javascript
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ExampleComponent from '../ExampleComponent.vue'

describe('ExampleComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(ExampleComponent, { props: { msg: 'Hello' } })
    expect(wrapper.text()).toContain('Hello')
  })

  it('emits event on click', async () => {
    const wrapper = mount(ExampleComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('submit')
  })
})
```

### 3. Run & Debug
-   Run all tests: `npm run test:unit`
-   Watch mode: `npm run test:unit -- --watch`
-   If a test fails, do not just delete the test. Fix the code to make the test pass.

## "One Case, Three Inferences" (舉一反三)
When fixing a bug or adding a feature:
1.  **Check Similar Code**: search for patterns that look like the code you just touched.
2.  **Refactor**: If you see duplicated logic, extract it into a composable or utility.
3.  **Prevent Regression**: Write a test case for the bug you just fixed so it never happens again.

## When to use this skill
-   When the USER asks to "add tests".
-   When a bug keeps reappearing.
-   As part of the `spec-kit` "verification" phase.
