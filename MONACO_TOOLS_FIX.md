# Monaco VSCode API Tools Path Resolution Fix

## Issue Description

The Kotlin extension was encountering errors related to file path resolution:

```
Uncaught Error: file 'extension-file://fwcd.vscode-kotlin/extension/node_modules/%40codingame/monaco-vscode-api/tools' is not a directory
```

Additionally, there were JavaScript errors in the redirected output showing issues with the `registerFile` and `registerExtensionFile` functions from the monaco-vscode-api extensions module.

## Root Cause

The issue was caused by how Vite was handling the `@codingame/monaco-vscode-api/tools` dependency:

1. In the `vite.config.js` file, `@codingame/monaco-vscode-api/tools` was listed as an external dependency, meaning it wouldn't be bundled with the application.
2. At runtime, the Kotlin extension was trying to access this directory but couldn't find it because it wasn't available in the expected location.

## Solution

Two changes were made to the `vite.config.js` file to fix this issue:

1. **Removed `@codingame/monaco-vscode-api/tools` from external dependencies**:
   ```javascript
   // Before
   external: [
     '@codingame/monaco-vscode-api/vscode',
     '@codingame/monaco-vscode-api/tools',  // This was preventing the tools from being bundled
     '@codingame/monaco-vscode-api/extensions',
     'vscode'
   ]

   // After
   external: [
     '@codingame/monaco-vscode-api/vscode',
     // Removed '@codingame/monaco-vscode-api/tools' to fix path resolution issues
     '@codingame/monaco-vscode-api/extensions',
     'vscode'
   ]
   ```

2. **Explicitly included `@codingame/monaco-vscode-api/tools` in optimizeDeps**:
   ```javascript
   // Before
   include: [
     'monaco-editor',
     '@codingame/monaco-vscode-api'
   ]

   // After
   include: [
     'monaco-editor',
     '@codingame/monaco-vscode-api',
     '@codingame/monaco-vscode-api/tools' // Explicitly include tools to ensure it's available
   ]
   ```

## Why This Fixes the Issue

By making these changes:

1. The `tools` directory from `@codingame/monaco-vscode-api` will now be bundled with the application instead of being treated as an external dependency.
2. Vite will pre-bundle this dependency, ensuring it's available at runtime.
3. When the Kotlin extension tries to access the `tools` directory, it will be able to find it in the bundle.

## Testing

To verify that the fix works:

1. Run `npm run dev` in the extension-test directory
2. Check the browser console and redirected output for any remaining errors
3. If the errors related to `monaco-vscode-api/tools` no longer appear, the fix was successful

## Additional Notes

If you encounter other similar errors with different paths, you may need to apply the same approach:

1. Remove the problematic path from the `external` array in `vite.config.js`
2. Add it to the `include` array in the `optimizeDeps` section

This ensures that the dependency is bundled with the application and available at runtime.