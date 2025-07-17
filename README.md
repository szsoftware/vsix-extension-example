# Kotlin VSCode Extension Project

This project contains a VSCode web extension for Kotlin language support and a test environment for the extension.

## Project Structure

The project is organized into two main modules:

- `extension/` - Contains the VSCode web extension for Kotlin language support
- `extension-test/` - Contains a test environment using Monaco Editor with Kotlin syntax highlighting

## Extension Module

The extension module provides Kotlin language support for VSCode Web, including:

- Syntax highlighting for Kotlin files
- Commands for working with Kotlin code
- Debugging support for Kotlin applications

For more details, see the [Extension README](./extension/README.md).

## Extension Test Module

The extension-test module provides a simple test environment for the Kotlin extension using Monaco Editor. It includes:

- A basic web page with Monaco Editor
- Kotlin syntax highlighting
- A development server for testing

For more details, see the [Extension Test README](./extension-test/README.md).

## Getting Started

### Installing Dependencies

To install dependencies for all modules, run:

```bash
npm run install:all
```

### Building

To build the extension:

```bash
npm run build:extension
```

To build the test environment:

```bash
npm run build:test
```

### Running the Test Environment

To run the test environment:

```bash
npm run start:test
```

This will start a development server at http://localhost:9000. Open this URL in your browser to see the test environment.

## Development Workflow

1. Make changes to the extension code in the `extension/src/` directory
2. Build the extension with `npm run build:extension`
3. Make changes to the test environment in the `extension-test/src/` directory
4. Run the test environment with `npm run start:test`
5. Test your changes in the browser

## Notes

- The extension and test modules are separate and have their own dependencies and build processes
- The test environment currently does not load the actual extension, but provides a simplified environment for testing Monaco Editor with Kotlin syntax highlighting
- For full VSCode extension testing, use the VSCode Extension Development tools