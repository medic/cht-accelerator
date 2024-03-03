# Supervisor Configuration

The Supervisor Configuration project uses the Community Health Toolkit (CHT) framework, providing essential tools for managing health-related data in communities by supervisors. 

## Automated Tests

This repository includes a comprehensive suite of automated tests to ensure the reliability and functionality of the Supervisor Configuration. The tests are designed to cover various scenarios, functionalities, and edge cases.

## Running the Tests

To execute the automated unittests, use the following command:

```bash
npm run unittest 
```

## Test Structure

### Test Files

- All test files are located in the `test` directory.
- Each test file corresponds to specific functionalities or scenarios.

### Test Organization

- Mocha's `describe` and `it` functions are used for organizing tests.
- The CHT Harness is employed for context management, form interactions, data submission, and assertions.

### Adding New Tests

1. **Create a New Test File:**
    - Place new test files in the `test` directory.

2. **Define Tests:**
    - Use Mocha syntax for test suites and test cases.

3. **CHT Harness Usage:**
    - Leverage CHT Harness methods for interacting with forms, submitting data, and making assertions.

4. **Setup and Teardown:**
    - Use `before` and `after` hooks for any necessary setup or teardown tasks.

**Note:** The test script in `package.json` is configured to run Mocha tests with the CHT Harness