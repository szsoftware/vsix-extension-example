// /home/sven/WebstormProjects/vsix-extension-example/extension-test/src/main.ts
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import { 
  initialize,
  getService,
  StandaloneServices
} from '@codingame/monaco-vscode-api';
import { IWorkbenchConstructionOptions } from '@codingame/monaco-vscode-api/services';
import { IExtensionService } from '@codingame/monaco-vscode-api/services';
import 'vscode/localExtensionHost';

// Import the VSIX file - using a dynamic import to handle errors
console.log('About to import VSIX file...');
// We'll use a try-catch block with dynamic import instead of a static import
// to better handle any errors during the import process
async function importVSIX() {
  try {
    console.log('Starting dynamic VSIX import...');
    await import('../../extension/vscode-kotlin-0.2.37-web.vsix');
    console.log('VSIX file imported successfully');
  } catch (error) {
    console.error('Error importing VSIX file:', error);
    console.error('VSIX import error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
  }
}
// We'll call this function later in the main function

// Function to update loading status
function updateLoadingStatus(message: string) {
  const loadingSubtext = document.getElementById('loading-subtext');
  if (loadingSubtext) {
    loadingSubtext.textContent = message;
  }
}

// Function to hide loading container
function hideLoadingContainer() {
  const loadingContainer = document.getElementById('loading-container');
  if (loadingContainer) {
    loadingContainer.classList.add('hidden');
    // Remove it from the DOM after the transition completes
    setTimeout(() => {
      loadingContainer.remove();
    }, 500);
  }
}

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

    window.MonacoEnvironment = {
      getWorker: (_moduleId, label) => {
        if (label === 'json') {
          return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
          return new tsWorker();
        }
        return new editorWorker();
      }
    }
    
    // Wait for the extension service to be ready
    updateLoadingStatus('Loading extensions...');
    console.log('Getting extension service...');
    const extensionService = await getService(IExtensionService);
    console.log('Extension service obtained');
    
    // Import the VSIX file dynamically to catch any errors
    updateLoadingStatus('Importing Kotlin extension...');
    await importVSIX();
    
    // Wait for the extension to be activated
    console.log('Waiting for extensions to be registered...');
    try {
      await extensionService.whenInstalledExtensionsRegistered();
      console.log('Extensions registered successfully');
    } catch (error) {
      console.error('Error during extension registration:', error);
      updateLoadingStatus(`Error during extension registration: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    console.log('Extensions registered');
    updateLoadingStatus('Extensions registered');
    
    // Register the Kotlin language if not already registered
    monaco.languages.register({
      id: 'kotlin',
      extensions: ['.kt', '.kts'],
      aliases: ['Kotlin', 'kotlin'],
      mimetypes: ['text/x-kotlin']
    });
    
    // Explicitly activate the Kotlin extension
    try {
      console.log('Explicitly activating Kotlin extension...');
      updateLoadingStatus('Activating Kotlin extension...');
      
      // Get all extensions
      console.log('Getting list of available extensions...');
      const extensions = extensionService.extensions;
      console.log('Available extensions:', extensions.map(ext => ext.identifier.value));
      
      // Find the Kotlin extension
      console.log('Searching for Kotlin extension...');
      const kotlinExtension = extensions.find(ext => 
        ext.identifier.value.toLowerCase().includes('kotlin'));
      
      if (kotlinExtension) {
        console.log('Found Kotlin extension:', kotlinExtension.identifier.value);
        console.log('Kotlin extension details:', {
          id: kotlinExtension.identifier.value,
          extensionLocation: kotlinExtension.extensionLocation.toString(),
          isActive: kotlinExtension.isActive,
          activationEvents: kotlinExtension.activationEvents,
          packageJSON: kotlinExtension.packageJSON ? Object.keys(kotlinExtension.packageJSON) : 'No packageJSON'
        });
        
        // Activate the extension
        console.log('Attempting to activate Kotlin extension...');
        try {
          await extensionService.activateExtension(kotlinExtension.identifier);
          console.log('Kotlin extension activated successfully');
          updateLoadingStatus('Kotlin extension activated');
        } catch (activationError) {
          console.error('Error during Kotlin extension activation:', activationError);
          console.error('Activation error details:', {
            message: activationError.message,
            stack: activationError.stack,
            name: activationError.name
          });
          updateLoadingStatus(`Error activating Kotlin extension: ${activationError.message}`);
        }
      } else {
        console.error('Kotlin extension not found');
        updateLoadingStatus('Error: Kotlin extension not found');
      }
    } catch (error) {
      console.error('Failed to activate Kotlin extension:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
      updateLoadingStatus(`Error activating Kotlin extension: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Create a simple editor with Kotlin syntax
    console.log('Creating editor...');
    updateLoadingStatus('Creating editor...');
    
    // Get the editor from the standalone services
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
    }, 500);
  } catch (error) {
    console.error('Failed to initialize VSCode Web Extension Test environment:', error);
    updateLoadingStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Add global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('GLOBAL ERROR:', event.message, event.filename, event.lineno, event.error);
  
  // Add more detailed logging for specific errors
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

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('UNHANDLED PROMISE REJECTION:', event.reason);
  
  // Add more detailed logging for specific rejections
  if (event.reason && typeof event.reason === 'object') {
    console.error('DETAILED REJECTION INFO:', {
      reason: event.reason.message || String(event.reason),
      stack: event.reason.stack || 'No stack trace',
      type: event.reason.constructor ? event.reason.constructor.name : typeof event.reason
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
// Start the application
  main().then(() => {
    // Wait a bit to ensure console redirection is fully initialized
    setTimeout(() => {

      // Log information about the Kotlin extension
      try {
        const extensionService = StandaloneServices.get(IExtensionService);
        const extensions = extensionService.extensions;
        console.log('DIAGNOSTIC: All registered extensions:', extensions.map(ext => ext.identifier.value));
        
        const kotlinExtension = extensions.find(ext => 
          ext.identifier.value.toLowerCase().includes('kotlin'));
          
        if (kotlinExtension) {
          console.log('DIAGNOSTIC: Kotlin extension details:', {
            id: kotlinExtension.identifier.value,
            isActive: kotlinExtension.isActive,
            activationEvents: kotlinExtension.activationEvents,
            extensionLocation: kotlinExtension.extensionLocation.toString()
          });
        } else {
          console.error('DIAGNOSTIC: Kotlin extension not found in registered extensions');
        }
      } catch (error) {
        console.error('DIAGNOSTIC: Error getting extension information:', error);
      }

    }, 2000); // Wait 2 seconds to ensure everything is initialized
  });
});