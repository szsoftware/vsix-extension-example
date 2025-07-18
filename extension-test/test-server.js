// Simple test server for console redirection
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port to listen on
const PORT = 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Handle console redirection endpoint
  if (req.url === '/__console_redirect') {
    if (req.method === 'HEAD') {
      // Just respond with 200 OK for connectivity test
      res.writeHead(200);
      res.end();
      return;
    }
    
    if (req.method === 'POST') {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          console.log('\n=== BROWSER CONSOLE LOG RECEIVED ===');
          
          const data = JSON.parse(body);
          const timestamp = data.timestamp;
          const url = data.url;
          const formattedTime = new Date(timestamp).toLocaleTimeString();
          
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
            
            // Log to the terminal
            logFn(`${prefix} ${formattedTime}:`, ...args);
            
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
            console.log(`Processing batch of ${data.logs.length} logs from ${url}`);
            // Process each log in the batch
            data.logs.forEach(processLogEntry);
          } else if (data.type && data.args) {
            // Process a single log
            processLogEntry(data);
          } else {
            console.error('\x1b[31m[Console Redirect Error]\x1b[0m Invalid log format:', data);
          }
          
          console.log('=== END OF BROWSER CONSOLE LOG ===\n');
        } catch (err) {
          console.error('\x1b[31m[Console Redirect Error]\x1b[0m Error processing console log from browser:', err);
          console.error('Raw body:', body);
        }
        
        // Send a response
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
      });
      
      return;
    }
  }
  
  // Serve the test HTML file for any other request
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'test-console-redirect.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error loading test-console-redirect.html: ${err.message}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Serve the console redirection script
  if (req.url === '/console-redirect.js') {
    fs.readFile(path.join(__dirname, 'test-console-redirect.js'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error loading test-console-redirect.js: ${err.message}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    });
    return;
  }
  
  // 404 for anything else
  res.writeHead(404);
  res.end('Not found');
});

// Start the server
server.listen(PORT, () => {
  console.log(`\x1b[42m\x1b[30m Console Redirection Test Server \x1b[0m`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to test console redirection`);
});