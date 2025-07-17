// /home/sven/WebstormProjects/vsix-extension-example/extension-test/src/main.ts
import * as monaco from 'monaco-editor';
import { 
  initialize,
  getService,
  StandaloneServices
} from '@codingame/monaco-vscode-api';
import { IWorkbenchConstructionOptions } from '@codingame/monaco-vscode-api/services';
import { IExtensionService } from '@codingame/monaco-vscode-api/services';
import 'vscode/localExtensionHost';

// Import the VSIX file
import '../../extension/vscode-kotlin-0.2.37-web.vsix';

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
    
    // Wait for the extension service to be ready
    updateLoadingStatus('Loading extensions...');
    const extensionService = await getService(IExtensionService);
    
    // The VSIX file is imported at the top of the file and will be loaded automatically
    // by the monaco-vscode-rollup-vsix-plugin
    
    // Wait for the extension to be activated
    await extensionService.whenInstalledExtensionsRegistered();
    
    console.log('Extensions registered');
    updateLoadingStatus('Extensions registered');

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

// Add comprehensive test console logs to verify redirection
console.log('TEST LOG: Console redirection test - basic log');
console.info('TEST INFO: Console redirection test - info message');
console.warn('TEST WARNING: Console redirection test - warning message');
console.error('TEST ERROR: Console redirection test - error message');

// Test with different data types
console.log('TEST TYPES: String, Number, Boolean:', 'Hello World', 42, true);
console.log('TEST ARRAY:', [1, 2, 3, 'four', { five: 5 }]);
console.log('TEST OBJECT:', { name: 'Test Object', value: 123, nested: { key: 'value' } });

// Test with Error objects
console.error('TEST ERROR OBJECT:', new Error('This is a test error'));

// Test with DOM elements (when in browser)
setTimeout(() => {
  if (typeof document !== 'undefined') {
    const element = document.getElementById('monaco-editor-container');
    console.log('TEST DOM ELEMENT:', element);
  }
}, 1000);

// Test with functions
console.log('TEST FUNCTION:', function testFunction() { return 'Hello'; });

// Test with undefined and null
console.log('TEST UNDEFINED and NULL:', undefined, null);

// Test with circular references
const circularObj = { name: 'Circular' };
circularObj.self = circularObj;
console.log('TEST CIRCULAR REFERENCE:', circularObj);

// Test with very long text
console.log('TEST LONG TEXT:', 'A'.repeat(1000));

// Test console.trace
console.trace('TEST TRACE: Stack trace test');

// Start the application
main();