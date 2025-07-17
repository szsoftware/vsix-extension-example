# Kotlin Extension Test Module with Vite and VSIX Loading

This module provides an extension test environment for the Kotlin extension using Monaco Editor and VSCode API. It now uses Vite instead of webpack and can load the Kotlin extension from a VSIX file.

## Structure

- `src/` - Source code for the extension test environment
  - `main.ts` - Main entry point that initializes the VSCode environment and loads the Kotlin extension
  - `index.html` - HTML template for the extension test environment

## Configuration Files

- `package.json` - Module metadata and dependencies
- `tsconfig.json` - TypeScript configuration
- `vite.config.js` - Vite configuration for building and serving the extension test environment

## Key Technologies

- **Vite**: Fast, modern build tool and development server
- **monaco-vscode-api**: Integrates VSCode functionality into Monaco Editor
- **monaco-vscode-rollup-vsix-plugin**: Enables loading VSIX files in the browser

## Building

To build the extension test environment, run:

```bash
npm install  # Install dependencies (first time only)
NODE_OPTIONS="--max-old-space-size=4096" npm run build  # Build with increased memory limit
```

This will create a `dist/` directory with the built files. The increased memory limit is necessary due to the size and complexity of the monaco-vscode-api dependencies.

## Development

For development, you can use the development mode:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev  # Start development server with increased memory limit
```

## Running

To run the extension test environment, use:

```bash
npm run preview  # After building, preview the production build
```

This will start a development server at http://localhost:9000. Open this URL in your browser to see the extension test environment.

## Features

- Full VSCode environment in the browser
- Loads the Kotlin extension from a VSIX file
- Kotlin syntax highlighting and language features
- Dark theme for better readability
- Loading indicator with progress updates
- Automatic layout adjustment to fit the container

## How It Works

1. The application initializes the VSCode environment using monaco-vscode-api
2. The VSIX file (kotlin-0.2.37-web.vsix) is imported and loaded automatically by the monaco-vscode-rollup-vsix-plugin
3. The extension is activated when the editor is created with a Kotlin file
4. The VSCode environment provides the full extension functionality in the browser

## Troubleshooting

- **Memory Issues**: If you encounter "JavaScript heap out of memory" errors, increase the Node.js memory limit using `NODE_OPTIONS="--max-old-space-size=4096"` or a higher value
- **Build Errors**: Make sure all dependencies are installed correctly and you're using the latest versions
- **Extension Loading Issues**: Check the browser console for error messages related to extension loading

## Relationship with Extension Module

The extension module in the parent directory contains the actual VSCode web extension for Kotlin language support. This extension test module now directly loads and tests that extension using the monaco-vscode-api, providing a more realistic testing environment.