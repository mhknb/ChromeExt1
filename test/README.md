# Test Infrastructure

This directory contains the test suite for the AI Content Exporter Chrome Extension.

## Test Framework

- **Vitest**: Fast unit test framework with Jest-compatible API
- **fast-check**: Property-based testing library for generating random test cases
- **jsdom**: DOM implementation for Node.js environment

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `setup.js` - Global test configuration and mocks
- `*.test.js` - Unit tests for individual modules
- `property-tests.*.test.js` - Property-based tests using fast-check

## Writing Tests

### Unit Tests

```javascript
import { describe, it, expect } from 'vitest';
import MyModule from '../src/my-module.js';

describe('MyModule', () => {
  it('should do something', () => {
    const module = new MyModule();
    expect(module.doSomething()).toBe(expected);
  });
});
```

### Property-Based Tests

```javascript
import { describe, it } from 'vitest';
import fc from 'fast-check';

describe('Property Tests', () => {
  it('should hold for all inputs', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (input) => {
          // Test property that should hold for all strings
          return someProperty(input);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Mocked APIs

The test setup mocks the following browser APIs:

- `chrome.storage.sync` - Chrome storage API
- `URL.createObjectURL` - Blob URL creation
- `URL.revokeObjectURL` - Blob URL cleanup
- `DOMParser` - HTML parsing

## Coverage

Test coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.
