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
- **Browser Console Redirection to Terminal** - JavaScript console output is redirected to the terminal

## How It Works

1. The application initializes the VSCode environment using monaco-vscode-api
2. The VSIX file (kotlin-0.2.37-web.vsix) is imported and loaded automatically by the monaco-vscode-rollup-vsix-plugin
3. The extension is activated when the editor is created with a Kotlin file
4. The VSCode environment provides the full extension functionality in the browser

## Browser Console Redirection

This project includes a custom Vite plugin that redirects browser console output to the terminal. This feature is particularly useful for debugging JavaScript errors that occur in the browser, as it allows you to see them directly in your terminal without having to open the browser's developer tools.

### How Console Redirection Works

The console redirection feature works by:

1. **Overriding Browser Console Methods**: The plugin injects JavaScript code that overrides the default `console.log`, `console.error`, `console.warn`, `console.info`, `console.debug`, and `console.trace` methods in the browser.

2. **Capturing Console Output**: When any of these methods are called in the browser, the plugin captures the output and sends it to the Vite development server via HTTP requests.

3. **Displaying in Terminal**: The server receives these logs and displays them in the terminal with appropriate formatting and color coding.

4. **Error Handling**: Special handling is provided for errors, including stack traces and unhandled promise rejections, making them more visible in the terminal.

### Features of Console Redirection

- **Color-Coded Output**: Different types of console messages (log, error, warn, info, debug) are displayed with different colors for easy identification.
- **Object Serialization**: Complex objects are properly serialized and formatted for display in the terminal.
- **Error Highlighting**: Errors are highlighted with red background to make them more noticeable.
- **Stack Traces**: Full stack traces are displayed for errors.
- **Batched Logging**: Logs are batched to reduce the number of HTTP requests.
- **Circular Reference Handling**: Objects with circular references are handled gracefully.

### Using Console Redirection

The console redirection is automatically enabled when you run the development server. You don't need to do anything special to use it - just run the server and any console output from the browser will appear in your terminal.

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

When you see output like this in your terminal, it means the console redirection is active:

```
Console Redirection Active Browser logs will appear in this terminal
```

### Debugging with Console Redirection

To debug JavaScript errors:

1. Add `console.log()` statements in your code to trace execution.
2. Watch the terminal for any error messages highlighted in red.
3. Check the stack traces provided for errors to locate the source of the problem.
4. Use different console methods (`console.warn()`, `console.error()`, etc.) to categorize your debug output.

For more detailed information about the console redirection feature, including recent changes, troubleshooting steps, and a simplified test environment, see the [CONSOLE-REDIRECTION.md](./CONSOLE-REDIRECTION.md) file.

## Troubleshooting

- **Memory Issues**: If you encounter "JavaScript heap out of memory" errors, increase the Node.js memory limit using `NODE_OPTIONS="--max-old-space-size=4096"` or a higher value
- **Build Errors**: Make sure all dependencies are installed correctly and you're using the latest versions
- **Extension Loading Issues**: Check the browser console for error messages related to extension loading
- **Console Redirection Issues**: If console logs are not appearing in the terminal, check that the Vite server is running correctly and that there are no network errors in the browser

## Relationship with Extension Module

The extension module in the parent directory contains the actual VSCode web extension for Kotlin language support. This extension test module now directly loads and tests that extension using the monaco-vscode-api, providing a more realistic testing environment.