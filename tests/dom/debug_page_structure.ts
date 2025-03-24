import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Analyzes and prints the structure of a webpage with enhanced debugging
 * @param url URL to analyze
 */
async function analyzePageStructure(url: string): Promise<void> {
  console.log(`\n${'='.repeat(50)}\nAnalyzing ${url}\n${'='.repeat(50)}`);
  
  const browser = await chromium.launch({ 
    headless: false 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the URL
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    
    // Get viewport dimensions
    const viewportInfo = await page.evaluate(() => {
      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        }
      };
    });
    
    console.log('\nViewport Information:');
    console.log(`Width: ${viewportInfo.viewport.width}`);
    console.log(`Height: ${viewportInfo.viewport.height}`);
    console.log(`ScrollX: ${viewportInfo.viewport.scrollX}`);
    console.log(`ScrollY: ${viewportInfo.viewport.scrollY}`);
    
    // Enhanced debug information for cookie consent and fixed position elements
    const debugInfo = await page.evaluate(() => {
      function getElementInfo(element: Element): any {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          className: element.className,
          position: style.position,
          rect: {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          isFixed: style.position === 'fixed',
          isSticky: style.position === 'sticky',
          zIndex: style.zIndex,
          visibility: style.visibility,
          display: style.display,
          opacity: style.opacity
        };
      }
      
      // Find cookie-related elements
      const cookieElements = Array.from(document.querySelectorAll('[id*="cookie"], [id*="consent"], [class*="cookie"], [class*="consent"]'));
      const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' || style.position === 'sticky';
      });
      
      return {
        cookieElements: cookieElements.map(el => getElementInfo(el)),
        fixedElements: fixedElements.map(el => getElementInfo(el))
      };
    });
    
    console.log('\nCookie-related Elements:');
    for (const elem of debugInfo.cookieElements) {
      console.log(`\nElement: ${elem.tag}#${elem.id} .${elem.className}`);
      console.log(`Position: ${elem.position}`);
      console.log(`Rect: ${JSON.stringify(elem.rect)}`);
      console.log(`Z-Index: ${elem.zIndex}`);
      console.log(`Visibility: ${elem.visibility}`);
      console.log(`Display: ${elem.display}`);
      console.log(`Opacity: ${elem.opacity}`);
    }
    
    console.log('\nFixed/Sticky Position Elements:');
    for (const elem of debugInfo.fixedElements) {
      console.log(`\nElement: ${elem.tag}#${elem.id} .${elem.className}`);
      console.log(`Position: ${elem.position}`);
      console.log(`Rect: ${JSON.stringify(elem.rect)}`);
      console.log(`Z-Index: ${elem.zIndex}`);
    }
    
    // Take a screenshot
    const screenshotDir = path.join(__dirname, '../../screenshots');
    fs.mkdirSync(screenshotDir, { recursive: true });
    
    const hostname = new URL(url).hostname.replace(/\./g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotDir, `${hostname}_${timestamp}.png`);
    
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\nScreenshot saved to: ${screenshotPath}`);
    
    // Wait for user input before closing
    console.log('\nPress Enter in the terminal to close the browser...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve(null));
    });
    
  } catch (error) {
    console.error(`Error analyzing ${url}:`, error);
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Main function to run the page structure analysis
 */
async function main() {
  const urls = [
    'https://www.mlb.com/yankees/stats/',
    'https://google.com',
    'https://reddit.com',
    'https://github.com'
  ];
  
  for (const url of urls) {
    await analyzePageStructure(url);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { analyzePageStructure };
