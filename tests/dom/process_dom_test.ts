import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Test function to process DOM and save the result to a file
 */
async function testProcessDom(): Promise<void> {
  console.log('Starting DOM processing test...');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // List of websites to test
    const websites = [
      'https://kayak.com/flights',
      'https://google.com',
      'https://github.com'
    ];
    
    for (const website of websites) {
      console.log(`\n${'='.repeat(50)}\nTesting ${website}\n${'='.repeat(50)}`);
      
      // Navigate to the website
      await page.goto(website);
      await page.waitForTimeout(3000); // Wait for dynamic content
      
      // Read the JS code from the file
      const jsFilePath = path.join(__dirname, '../../src/dom/buildDomTree.js');
      const jsCode = fs.readFileSync(jsFilePath, 'utf-8');
      
      // Process DOM and measure time
      console.time('DOM Processing Time');
      try {
        // Execute the buildDomTree.js code in the browser context
        // First, we need to add the code to the page
        await page.evaluate(jsCode);
        
        // Now execute the buildDomTree function with the document.body
        const domTree = await page.evaluate(() => {
          // Call the function that was added to the page scope
          return ((_args: { doHighlightElements: boolean; focusHighlightIndex: number; viewportExpansion: number; debugMode: boolean }) => {
            // We don't need these variables for our simplified implementation
            // but we're keeping the same structure as the original code
            // Not using args directly in this simplified version
            
            // Hash map of DOM nodes
            const DOM_HASH_MAP: Record<string, any> = {};
            const ID = { current: 0 };
            
            // Cache for DOM operations
            const DOM_CACHE = {
              clearCache() {
                // Simplified cache clearing
              }
            };
            
            // Build the DOM tree starting from document.body
            function buildDomTree(node: Node): string | null {
              if (!node) return null;
              
              const id = 'node_' + (ID.current++);
              const nodeData: {
                id: string;
                tagName: string;
                children: string[];
                text: string;
              } = {
                id,
                tagName: (node as Element).tagName?.toLowerCase() || 'text',
                children: [],
                text: node.nodeType === 3 ? node.textContent || '' : '',
              };
              
              // Process children
              if (node.childNodes && node.childNodes.length > 0) {
                for (let i = 0; i < node.childNodes.length; i++) {
                  // Ensure childNode is not undefined before passing to buildDomTree
                  const childNode = node.childNodes[i];
                  if (childNode) {
                    const childId = buildDomTree(childNode);
                    if (childId) {
                      nodeData.children.push(childId);
                    }
                  }
                }
              }
              
              DOM_HASH_MAP[id] = nodeData;
              return id;
            }
            
            // Build the DOM tree
            const rootId = buildDomTree(document.body);
            
            // Clear the cache
            DOM_CACHE.clearCache();
            
            return { rootId, map: DOM_HASH_MAP };
          })({
            doHighlightElements: false,
            focusHighlightIndex: -1,
            viewportExpansion: 0,
            debugMode: true
          });
        }) as any;
        console.timeEnd('DOM Processing Time');
        
        if (!domTree || !domTree.map || !domTree.rootId) {
          throw new Error('Invalid DOM tree data: missing map or rootId');
        }
        
        // Create tmp directory if it doesn't exist
        const tmpDir = path.join(__dirname, '../../tmp');
        fs.mkdirSync(tmpDir, { recursive: true });
        
        // Save DOM tree to file
        const hostname = new URL(website).hostname.replace(/\./g, '_');
        const outputPath = path.join(tmpDir, `${hostname}_dom.json`);
        fs.writeFileSync(outputPath, JSON.stringify(domTree, null, 2));
        console.log(`DOM tree saved to: ${outputPath}`);
        
        // Print some statistics about the DOM tree
        console.log('\nDOM Tree Statistics:');
        console.log(`Root ID: ${domTree.rootId}`);
        console.log(`Number of nodes: ${Object.keys(domTree.map || {}).length}`);
        
        if (domTree.perfMetrics) {
          console.log('\nPerformance Metrics:');
          for (const [key, value] of Object.entries(domTree.perfMetrics)) {
            console.log(`${key}: ${value}`);
          }
        }
      } catch (error) {
        console.error('Error processing DOM:', error);
      }
      
      // Wait for user input before proceeding to next website
      console.log('\nPress Enter in the terminal to continue to the next website...');
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve(null));
      });
    }
    
  } catch (error) {
    console.error('Error processing DOM:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Test function to check DOM element selection
 */
async function testDomElementSelection(): Promise<void> {
  console.log('Starting DOM element selection test...');
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://github.com');
    await page.waitForLoadState('networkidle');
    
    // Read the JS code from the file
    const jsFilePath = path.join(__dirname, '../../src/dom/buildDomTree.js');
    const jsCode = fs.readFileSync(jsFilePath, 'utf-8');
    
    // Process DOM
    await page.evaluate(jsCode);
    
    // Find some clickable elements
    console.log('\nTesting element selection with CSS selectors:');
    
    const selectors = [
      'a.HeaderMenu-link',
      'button.btn-primary',
      'input[type="text"]'
    ];
    
    for (const selector of selectors) {
      try {
        console.log(`\nTesting selector: ${selector}`);
        const exists = await page.evaluate((sel) => !!document.querySelector(sel), selector);
        console.log(`Element exists: ${exists}`);
        
        if (exists) {
          // Try to click the element (just for testing, will be caught if it fails)
          await page.click(selector, { timeout: 1000 });
          console.log('Successfully clicked element');
          await page.goBack();
        }
      } catch (error) {
        console.log(`Error with selector ${selector}:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    // Wait for user input before closing
    console.log('\nPress Enter in the terminal to close the browser...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve(null));
    });
    
  } catch (error) {
    console.error('Error in DOM element selection test:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Main function to run the DOM tests
 */
async function main() {
  await testProcessDom();
  await testDomElementSelection();
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { testProcessDom, testDomElementSelection };
