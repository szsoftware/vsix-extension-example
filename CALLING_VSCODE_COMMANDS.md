# Calling VSCode Commands from main.ts

This document explains how to call VSCode commands registered in an extension from the main.ts file in the extension-test environment.

## Overview

VSCode extensions can register commands that provide functionality to users. These commands can be called programmatically from other parts of the application, including the main.ts file in the extension-test environment.

In this example, we'll show how to call the "sample.helloWorld" command that is registered in extension.ts.

## Prerequisites

1. The extension must be loaded and activated
2. The command must be registered by the extension
3. The ICommandService must be available through StandaloneServices

## Implementation Steps

### 1. Import ICommandService

First, import the ICommandService from '@codingame/monaco-vscode-api/services':

```typescript
import { ICommandService } from '@codingame/monaco-vscode-api/services';
```

### 2. Create a Function to Execute the Command

Create a function that gets the command service and executes the command:

```typescript
async function executeHelloWorldCommand() {
  try {
    console.log('Attempting to execute sample.helloWorld command...');
    const commandService = StandaloneServices.get(ICommandService);
    
    if (commandService && typeof commandService.executeCommand === 'function') {
      await commandService.executeCommand('sample.helloWorld')
        .then(() => {
          console.log('Command sample.helloWorld executed successfully');
        })
        .catch((error) => {
          console.error('Error executing command sample.helloWorld:', error);
        });
    } else {
      console.error('Command service not available or executeCommand method not found');
    }
  } catch (error) {
    console.error('Error accessing command service:', error);
  }
}
```

### 3. Add a Button to the UI (Optional)

For a user-friendly way to execute the command, add a button to the UI:

```html
<div id="command-button-container">
    <button id="execute-command-button">Execute Hello World Command</button>
</div>
```

And style it:

```css
#command-button-container {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
}
#execute-command-button {
    background-color: #0e639c;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}
#execute-command-button:hover {
    background-color: #1177bb;
}
```

### 4. Connect the Button to the Function

Add an event listener to the button to call the function when clicked:

```typescript
const commandButton = document.getElementById('execute-command-button');
if (commandButton) {
  console.log('Setting up command button click event');
  commandButton.addEventListener('click', () => {
    console.log('Command button clicked');
    executeHelloWorldCommand();
  });
} else {
  console.error('Command button not found in the DOM');
}
```

## Complete Example

Here's a complete example of how to call a VSCode command from main.ts:

```typescript
import { ICommandService } from '@codingame/monaco-vscode-api/services';
import { StandaloneServices } from '@codingame/monaco-vscode-api';

// Function to execute the sample.helloWorld command
async function executeHelloWorldCommand() {
  try {
    console.log('Attempting to execute sample.helloWorld command...');
    const commandService = StandaloneServices.get(ICommandService);
    
    if (commandService && typeof commandService.executeCommand === 'function') {
      await commandService.executeCommand('sample.helloWorld')
        .then(() => {
          console.log('Command sample.helloWorld executed successfully');
        })
        .catch((error) => {
          console.error('Error executing command sample.helloWorld:', error);
        });
    } else {
      console.error('Command service not available or executeCommand method not found');
    }
  } catch (error) {
    console.error('Error accessing command service:', error);
  }
}

// Call the function when needed, e.g., when a button is clicked
document.getElementById('execute-command-button').addEventListener('click', executeHelloWorldCommand);
```

## Testing

To test the implementation:

1. Run the application with `npm run dev` in the extension-test directory
2. Wait for the environment to load and the extension to be activated
3. Click the "Execute Hello World Command" button in the top-right corner
4. Check the browser console for logs indicating the command was executed
5. Verify that the information message "Hello World from sample in a web extension host!" appears

## Troubleshooting

If the command doesn't execute correctly, check the following:

1. Make sure the extension is loaded and activated
2. Verify that the command is registered by the extension
3. Check the browser console for any errors
4. Ensure that the command ID matches exactly what's registered in the extension

## Notes

- Commands can only be executed after the extension is activated
- The command service is only available after the VSCode environment is initialized
- Command execution is asynchronous, so use promises or async/await to handle the result