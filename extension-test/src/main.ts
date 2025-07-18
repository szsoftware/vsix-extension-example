/**
 * VSCode Web Extension Test Environment
 * 
 * This file initializes a VSCode web environment and loads the Kotlin extension.
 */
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import { 
  initialize,
  StandaloneServices
} from '@codingame/monaco-vscode-api';
import { IWorkbenchConstructionOptions } from '@codingame/monaco-vscode-api/services';
import { IExtensionService } from '@codingame/monaco-vscode-api/services';
import { ICommandService } from '@codingame/monaco-vscode-api/services';
import 'vscode/localExtensionHost';
import { ExtensionIdentifier } from "@codingame/monaco-vscode-api/vscode/src/vs/platform/extensions/common/extensions";

// Constants
const KOTLIN_EXTENSION_ID = 'szsoftware.vscode-kotlin';

// UI Helper Functions
function updateLoadingStatus(message: string) {
  const loadingSubtext = document.getElementById('loading-subtext');
  if (loadingSubtext) {
    loadingSubtext.textContent = message;
  }
}

function hideLoadingContainer() {
  const loadingContainer = document.getElementById('loading-container');
  if (loadingContainer) {
    loadingContainer.classList.add('hidden');
    setTimeout(() => loadingContainer.remove(), 500);
  }
}

// Import the VSIX file dynamically to handle errors
async function importVSIX() {
  try {
    console.log('Starting dynamic VSIX import...');
    // Use string literal for import path to ensure proper resolution by Vite
    await import('../../extension/vscode-kotlin-0.2.37-web.vsix');
    console.log('VSIX file imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing VSIX file:', error);
    console.error('VSIX import error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return false;
  }
}

// Log extension details safely (handling potentially undefined properties)
function logExtensionDetails(extension: any, prefix = '') {
  try {
    console.log(`${prefix}Kotlin extension details:`, {
      id: extension.identifier?.value || 'Unknown ID',
      extensionLocation: extension.extensionLocation?.toString() || 'Unknown location',
      // Note: isActive and activationEvents might not be available in the standard interface
      isActive: extension.isActive !== undefined ? extension.isActive : 'Property not available',
      activationEvents: extension.activationEvents || 'No activation events',
      packageJSON: extension.packageJSON ? Object.keys(extension.packageJSON) : 'No packageJSON'
    });
  } catch (error) {
    console.error(`${prefix}Error logging extension details:`, error);
  }
}

// Try to activate an extension safely by triggering its activation events
async function tryActivateExtension(extensionService: any, extension: any) {
  try {
    console.log('Attempting to activate Kotlin extension by triggering activation events...');
    
    // Get the activation events from the extension
    const activationEvents = extension.activationEvents || [];
    console.log('Extension activation events:', activationEvents);
    
    // Check if the extension has the onLanguage:kotlin activation event
    if (activationEvents.includes('onLanguage:kotlin')) {
      console.log('Found onLanguage:kotlin activation event, triggering it...');
      
      // Create a model with Kotlin language to trigger the onLanguage:kotlin event
      const modelUri = monaco.Uri.parse('inmemory://model.kt');
      const model = monaco.editor.getModel(modelUri) || 
                    monaco.editor.createModel('// Kotlin file to trigger extension activation\nfun main() {\n    println("Hello, World!")\n}', 'kotlin', modelUri);
      
      console.log('Created Kotlin model to trigger activation event');
      
      // Wait a moment for the activation event to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the extension is now active
      if (typeof extensionService.activateByEvent === 'function') {
        // Explicitly trigger the activation event
        await extensionService.activateByEvent('onLanguage:kotlin');
        console.log('Explicitly triggered onLanguage:kotlin event');
      }
      
      console.log('Kotlin extension should now be activated via language activation event');
      return true;
    } else {
      console.log('No onLanguage:kotlin activation event found, trying direct activation...');
      
      // Fall back to direct activation methods
      if (typeof extensionService.activateExtension === 'function') {
        await extensionService.activateExtension(extension.identifier);
        console.log('Kotlin extension activated successfully using activateExtension');
        return true;
      } else if (typeof extensionService.activateById === 'function') {
        await extensionService.activateById(extension.identifier.value);
        console.log('Kotlin extension activated successfully using activateById');
        return true;
      } else {
        console.warn('No suitable activation method found on extension service');
        return false;
      }
    }
  } catch (error) {
    console.error('Error during Kotlin extension activation:', error);
    console.error('Activation error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return false;
  }
}

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

// Main application initialization
async function main() {
  // Get the container element
  const container = document.getElementById('monaco-editor-container');
  if (!container) {
    console.error('Container element not found');
    updateLoadingStatus('Error: Container element not found');
    return;
  }

  try {
    console.log('Initializing VSCode Web environment...');
    updateLoadingStatus('Initializing VSCode Web environment...');
    
    // Define the workbench configuration
    const workbenchConfig: IWorkbenchConstructionOptions = {
      productConfiguration: {
        nameShort: 'Kotlin Extension Test',
        nameLong: 'Kotlin Extension Test Environment',
      },
      workspaceProvider: {
        trusted: true,
        workspace: {
          workspaceUri: 'inmemory://test-workspace',
          workspaceFolder: {
            uri: 'inmemory://test-workspace',
            name: 'Test Workspace',
            index: 0,
          },
        },
        open: async () => true,
      },
    };

    // Initialize the VSCode services
    await initialize({}, container, workbenchConfig);

    // Configure Monaco environment with appropriate workers
    window.MonacoEnvironment = {
      getWorker: (_moduleId, label) => {
        if (label === 'json') return new jsonWorker();
        if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
        if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
        if (label === 'typescript' || label === 'javascript') return new tsWorker();
        return new editorWorker();
      }
    };
    
    // Get extension service
    updateLoadingStatus('Loading extensions...');
    console.log('Getting extension service...');
    const extensionService = StandaloneServices.get(IExtensionService);
    console.log('Extension service obtained');
    
    // Import the VSIX file
    updateLoadingStatus('Importing Kotlin extension...');
    await importVSIX();
    
    // Wait for extensions to be registered
    console.log('Waiting for extensions to be registered...');
    try {
      await extensionService.whenInstalledExtensionsRegistered();
      console.log('Extensions registered successfully');
    } catch (error) {
      console.error('Error during extension registration:', error);
      updateLoadingStatus(`Error during extension registration: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    updateLoadingStatus('Extensions registered');
    
    // Register the Kotlin language
    monaco.languages.register({
      id: 'kotlin',
      extensions: ['.kt', '.kts'],
      aliases: ['Kotlin', 'kotlin'],
      mimetypes: ['text/x-kotlin']
    });
    
    // Try to find and activate the Kotlin extension with retry mechanism
    try {
      console.log('Looking for Kotlin extension...');
      updateLoadingStatus('Looking for Kotlin extension...');

      // Function to find the Kotlin extension with retry
      const findKotlinExtension = async (maxRetries = 3, delayMs = 1000) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          console.log(`Attempt ${attempt}/${maxRetries} to find Kotlin extension...`);
          
          // Get all extensions
          const extensions = extensionService.extensions || [];
          console.log('Available extensions:', extensions.map(ext => ext.identifier.value));
          
          // Find the Kotlin extension
          const kotlinExtension = extensions.find(ext => 
            ext.identifier.value === KOTLIN_EXTENSION_ID);
          
          if (kotlinExtension) {
            console.log('Found Kotlin extension:', kotlinExtension.identifier.value);
            return kotlinExtension;
          }
          
          if (attempt < maxRetries) {
            console.log(`Kotlin extension not found, retrying in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
        
        return null;
      };
      
      // Try to find the Kotlin extension with retry
      const kotlinExtension = await findKotlinExtension();
      
      if (kotlinExtension) {
        logExtensionDetails(kotlinExtension);
        
        // Try to activate the extension
        console.log('Attempting to activate Kotlin extension...');
        const activated = await tryActivateExtension(extensionService, kotlinExtension);
        updateLoadingStatus(activated ? 
          'Kotlin extension activated' : 
          'Kotlin extension found but activation may have failed');
      } else {
        console.error('Kotlin extension not found after multiple attempts');
        updateLoadingStatus('Error: Kotlin extension not found after multiple attempts');
      }
    } catch (error) {
      console.error('Failed to activate Kotlin extension:', error);
      updateLoadingStatus(`Error with Kotlin extension: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Create a simple editor with Kotlin syntax
    console.log('Creating editor...');
    updateLoadingStatus('Creating editor...');
    
    const editor = monaco.editor.create(container, {
      value: '// Kotlin code example\nfun main() {\n    println("Hello, World!")\n}',
      language: 'kotlin',
      theme: 'vs-dark',
      automaticLayout: true,
    });

    console.log('VSCode Web Extension Test environment loaded successfully');
    updateLoadingStatus('Environment loaded successfully');
    
    // Hide the loading container
    setTimeout(() => {
      hideLoadingContainer();
      
      // Set up the command button click event
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
    }, 500);
    
    // Return the editor instance for potential further use
    return editor;
  } catch (error) {
    console.error('Failed to initialize VSCode Web Extension Test environment:', error);
    updateLoadingStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// Add global error handlers
window.addEventListener('error', (event) => {
  console.error('GLOBAL ERROR:', event.message, event.filename, event.lineno, event.error);
  
  if (event.filename && event.filename.includes('monaco-vscode-api')) {
    console.error('DETAILED ERROR INFO:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error ? {
        name: event.error.name,
        message: event.error.message,
        stack: event.error.stack
      } : 'No error object'
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('UNHANDLED PROMISE REJECTION:', event.reason);
  
  if (event.reason && typeof event.reason === 'object') {
    console.error('DETAILED REJECTION INFO:', {
      reason: event.reason.message || String(event.reason),
      stack: event.reason.stack || 'No stack trace',
      type: event.reason.constructor ? event.reason.constructor.name : typeof event.reason
    });
  }
});

// Start the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  main().then(() => {
    // After initialization, log diagnostic information about the extension
    setTimeout(() => {
      try {
        const extensionService = StandaloneServices.get(IExtensionService);
        const extensions = extensionService.extensions || [];
        console.log('DIAGNOSTIC: All registered extensions:', extensions.map(ext => ext.identifier.value));
        
        const kotlinExtension = extensions.find(ext => ext.identifier.value === KOTLIN_EXTENSION_ID);
        
        if (kotlinExtension) {
          logExtensionDetails(kotlinExtension, 'DIAGNOSTIC: ');
        } else {
          console.error('DIAGNOSTIC: Kotlin extension not found in registered extensions');
        }
      } catch (error) {
        console.error('DIAGNOSTIC: Error getting extension information:', error);
      }
    }, 2000); // Wait 2 seconds to ensure everything is initialized
  });
});