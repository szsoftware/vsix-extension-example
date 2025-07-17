# Kotlin Extension Packaging

## Issue Fixed

When running the `package-extension` script, the following error occurred:
```
ERROR  The specified icon 'resources/Icon128.png' wasn't found in the extension.
```

## Root Cause

The issue was in the `package.json` file where the icon path was incorrectly specified as:
```json
"icon": "../resources/Icon128.png",
```

This path was looking for the icon file one directory up from the extension directory. However, the icon file was actually located in the resources directory inside the extension directory.

## Solution

The solution was to update the icon path in the `package.json` file to correctly point to the resources directory inside the extension directory:
```json
"icon": "resources/Icon128.png",
```

After making this change, the packaging process completed successfully.