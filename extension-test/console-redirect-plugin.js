// console-redirect-plugin.js
// A Vite plugin to redirect browser console output to the terminal

/**
 * Console redirection plugin for Vite
 * 
 * This plugin captures browser console logs and redirects them to the terminal.
 * It works by:
 * 1. Creating a virtual module that overrides the default console methods
 * 2. Injecting this module into the HTML
 * 3. Setting up a server middleware to receive and display the logs
 * 
 * @param {Object} options - Plugin options
 * @param {boolean} options.debug - Enable debug mode for the plugin itself
 * @returns {import('vite').Plugin} Vite plugin
 */
export default function consoleRedirectPlugin(options = { debug: false }) {
  const debug = options.debug;
  
  // Helper function for plugin's own debug logs
  const pluginLog = (message, ...args) => {
    if (debug) {
      console.log(`\x1b[35m[Console Redirect Plugin]\x1b[0m ${message}`, ...args);
    }
  };
  
  pluginLog('Plugin initialized');
  const virtualModuleId = 'virtual:console-redirect';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'console-redirect-plugin',
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `
          // Console redirection module
          // This code overrides the default console methods to send logs to the server
          
          (function() {
            // Store original console methods
            const originalConsole = {
              log: console.log,
              info: console.info,
              warn: console.warn,
              error: console.error,
              debug: console.debug,
              trace: console.trace
            };
            
            // Track if we're currently in a redirection to prevent infinite loops
            let isRedirecting = false;
            
            // Queue for batching logs
            let logQueue = [];
            let queueTimer = null;
            const QUEUE_FLUSH_INTERVAL = 100; // ms
            
            // Function to process and send the log queue
            function flushLogQueue() {
              if (logQueue.length === 0) return;
              
              const queueCopy = [...logQueue];
              logQueue = [];
              
              try {
                fetch('/__console_redirect', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    batch: true,
                    logs: queueCopy,
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                  })
                }).catch(err => {
                  if (!isRedirecting) {
                    isRedirecting = true;
                    originalConsole.error('[Console Redirect] Failed to send logs to server:', err);
                    isRedirecting = false;
                  }
                });
              } catch (err) {
                if (!isRedirecting) {
                  isRedirecting = true;
                  originalConsole.error('[Console Redirect] Error sending logs:', err);
                  isRedirecting = false;
                }
              }
            }
            
            // Function to add a log to the queue
            function queueLog(type, args) {
              try {
                // Convert arguments to a more serializable format
                const serializedArgs = Array.from(args).map(arg => {
                  // Handle Error objects
                  if (arg instanceof Error) {
                    return {
                      type: 'Error',
                      name: arg.name,
                      message: arg.message,
                      stack: arg.stack
                    };
                  } 
                  // Handle DOM elements
                  else if (arg instanceof HTMLElement) {
                    return {
                      type: 'HTMLElement',
                      tagName: arg.tagName,
                      id: arg.id,
                      className: arg.className,
                      innerHTML: arg.innerHTML.substring(0, 100) + (arg.innerHTML.length > 100 ? '...' : '')
                    };
                  }
                  // Handle other objects
                  else if (typeof arg === 'object' && arg !== null) {
                    try {
                      return JSON.parse(JSON.stringify(arg));
                    } catch (e) {
                      return \`[Object: \${arg.constructor?.name || typeof arg}]\`;
                    }
                  }
                  // Handle functions
                  else if (typeof arg === 'function') {
                    return \`[Function: \${arg.name || 'anonymous'}]\`;
                  }
                  // Pass through primitive values
                  return arg;
                });
                
                // Add to queue
                logQueue.push({
                  type,
                  args: serializedArgs
                });
                
                // Set up timer to flush queue if not already set
                if (!queueTimer) {
                  queueTimer = setTimeout(() => {
                    queueTimer = null;
                    flushLogQueue();
                  }, QUEUE_FLUSH_INTERVAL);
                }
              } catch (err) {
                if (!isRedirecting) {
                  isRedirecting = true;
                  originalConsole.error('[Console Redirect] Error processing log:', err);
                  isRedirecting = false;
                }
              }
            }
            
            // Override console methods
            console.log = function() {
              originalConsole.log.apply(console, arguments);
              if (!isRedirecting) {
                isRedirecting = true;
                queueLog('log', arguments);
                isRedirecting = false;
              }
            };
            
            console.info = function() {
              originalConsole.info.apply(console, arguments);
              if (!isRedirecting) {
                isRedirecting = true;
                queueLog('info', arguments);
                isRedirecting = false;
              }
            };
            
            console.warn = function() {
              originalConsole.warn.apply(console, arguments);
              if (!isRedirecting) {
                isRedirecting = true;
                queueLog('warn', arguments);
                isRedirecting = false;
              }
            };
            
            console.error = function() {
              originalConsole.error.apply(console, arguments);
              if (!isRedirecting) {
                isRedirecting = true;
                queueLog('error', arguments);
                isRedirecting = false;
              }
            };
            
            console.debug = function() {
              originalConsole.debug.apply(console, arguments);
              if (!isRedirecting) {
                isRedirecting = true;
                queueLog('debug', arguments);
                isRedirecting = false;
              }
            };
            
            console.trace = function() {
              originalConsole.trace.apply(console, arguments);
              if (!isRedirecting) {
                isRedirecting = true;
                queueLog('trace', arguments);
                isRedirecting = false;
              }
            };
            
            // Also capture unhandled errors and promise rejections
            window.addEventListener('error', (event) => {
              if (!isRedirecting) {
                isRedirecting = true;
                queueLog('error', [{
                  type: 'Error',
                  name: 'Unhandled Error',
                  message: event.message,
                  stack: event.error?.stack,
                  source: event.filename,
                  line: event.lineno,
                  column: event.colno
                }]);
                isRedirecting = false;
              }
            });
            
            window.addEventListener('unhandledrejection', (event) => {
              if (!isRedirecting) {
                isRedirecting = true;
                queueLog('error', [{
                  type: 'Error',
                  name: 'Unhandled Promise Rejection',
                  message: event.reason?.message || String(event.reason),
                  stack: event.reason?.stack
                }]);
                isRedirecting = false;
              }
            });
            
            // Log that the console redirection is active
            console.log('[Console Redirect] Console redirection to terminal is active');
          })();
        `;
      }
    },
    
    configureServer(server) {
      pluginLog('Configuring server middleware');
      
      // Add middleware to handle console logs sent from the client
      server.middlewares.use((req, res, next) => {
        if (req.url === '/__console_redirect' && req.method === 'POST') {
          pluginLog('Received console log request');
          
          let body = '';
          
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const timestamp = data.timestamp;
              const url = data.url;
              const formattedTime = new Date(timestamp).toLocaleTimeString();
              const source = url ? `[${url.split('/').pop()}]` : '';
              
              // Helper function to process a single log entry
              const processLogEntry = (entry) => {
                const { type, args } = entry;
                
                // Use different colors for different log types
                let logFn;
                let prefix;
                
                switch (type) {
                  case 'error':
                    logFn = console.error;
                    prefix = '\x1b[31m[Browser Error]\x1b[0m'; // Red
                    break;
                  case 'warn':
                    logFn = console.warn;
                    prefix = '\x1b[33m[Browser Warning]\x1b[0m'; // Yellow
                    break;
                  case 'info':
                    logFn = console.info;
                    prefix = '\x1b[36m[Browser Info]\x1b[0m'; // Cyan
                    break;
                  case 'debug':
                    logFn = console.debug;
                    prefix = '\x1b[35m[Browser Debug]\x1b[0m'; // Magenta
                    break;
                  case 'trace':
                    logFn = console.log;
                    prefix = '\x1b[35m[Browser Trace]\x1b[0m'; // Magenta
                    break;
                  default:
                    logFn = console.log;
                    prefix = '\x1b[32m[Browser Log]\x1b[0m'; // Green
                }
                
                // Format the arguments for better display
                const formattedArgs = args.map(arg => {
                  if (arg && typeof arg === 'object') {
                    if (arg.type === 'Error') {
                      const error = new Error(arg.message);
                      if (arg.stack) {
                        error.stack = arg.stack;
                      }
                      if (arg.name) {
                        error.name = arg.name;
                      }
                      return error;
                    } else if (arg.type === 'HTMLElement') {
                      return `<${arg.tagName.toLowerCase()}${arg.id ? ` id="${arg.id}"` : ''}${arg.className ? ` class="${arg.className}"` : ''}>${arg.innerHTML ? '...' : ''}</${arg.tagName.toLowerCase()}>`;
                    }
                  }
                  return arg;
                });
                
                // Log to the terminal
                logFn(`${prefix} ${formattedTime} ${source}:`, ...formattedArgs);
                
                // Special handling for errors to make them more visible
                if (type === 'error') {
                  console.log('\x1b[41m\x1b[37m JavaScript Error Detected \x1b[0m');
                  
                  // If we have an error with a stack trace, print it nicely
                  const errorArg = args.find(arg => arg && typeof arg === 'object' && arg.type === 'Error');
                  if (errorArg && errorArg.stack) {
                    console.log('\x1b[31m' + errorArg.stack + '\x1b[0m');
                  }
                }
              };
              
              // Check if this is a batch of logs or a single log
              if (data.batch && Array.isArray(data.logs)) {
                pluginLog(`Processing batch of ${data.logs.length} logs`);
                // Process each log in the batch
                data.logs.forEach(processLogEntry);
              } else if (data.type && data.args) {
                // Process a single log
                processLogEntry(data);
              } else {
                console.error('\x1b[31m[Console Redirect Error]\x1b[0m Invalid log format:', data);
              }
            } catch (err) {
              console.error('\x1b[31m[Console Redirect Error]\x1b[0m Error processing console log from browser:', err);
              console.error('Raw body:', body);
            }
            
            // Send a response
            res.statusCode = 200;
            res.end('OK');
          });
        } else {
          next();
        }
      });
      
      // Log when the server is ready
      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address();
        const port = typeof address === 'object' ? address?.port : undefined;
        console.log(`\x1b[42m\x1b[30m Console Redirection Active \x1b[0m Browser logs will appear in this terminal`);
        console.log(`Server running at: \x1b[36mhttp://localhost:${port}\x1b[0m`);
      });
    },
    
    transformIndexHtml() {
      // Add a script tag to import our virtual module
      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: `import '${virtualModuleId}';`,
          injectTo: 'head-prepend'
        }
      ];
    }
  };
}