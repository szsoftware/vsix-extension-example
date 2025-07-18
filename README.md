# Kotlin VSCode Extension Project

This project contains a VSCode web extension for Kotlin language support and a test environment for the extension.

## Project Structure

The project is organized into two main modules:

- `extension/` - Contains the VSCode web extension for Kotlin language support
- `extension-test/` - Contains a test environment using Monaco Editor with Kotlin syntax highlighting

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
cd extension && npm run build && npm run package-extension
```

This will result in having a "extension/*.vsix" file.

To build and start the test environment:

```bash
cd extension-test && npm run dev
```

This will start a development server at http://localhost:9000. Open this URL in your browser to see the test environment.
