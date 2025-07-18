// Console redirection script for browser
// This script overrides the default console methods to send logs to the server

(function() {
  console.log('Console redirection script loaded');
  
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
      // Log that we're sending logs to the server (only visible in browser console)
      originalConsole.log('[Console Redirect] Sending ' + queueCopy.length + ' logs to server');
      
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
      }).then(response => {
        if (!response.ok) {
          throw new Error('Server responded with status: ' + response.status);
        }
        originalConsole.log('[Console Redirect] Successfully sent logs to server');
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
            return `[Object: ${arg.constructor?.name || typeof arg}]`;
          }
        }
        // Handle functions
        else if (typeof arg === 'function') {
          return `[Function: ${arg.name || 'anonymous'}]`;
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
  
  // Update the status on the page
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent += '\nConsole redirection initialized and active';
  }
  
  // Log that the console redirection is active
  console.log('[Console Redirect] Console redirection to terminal is active');
})();