const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');

(async () => {
    const chrome = await chromeLauncher.launch({
        port: 9222,
        chromeFlags: ['--headless=new', '--disable-gpu']
    });

    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log("Taking landing page screenshot...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: '../../screenshots/landing-page.png' });

    console.log("Logging in as candidate...");
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'john@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log("Taking dashboard screenshot...");
    await page.screenshot({ path: '../../screenshots/dashboard.png' });

    console.log("Taking coding editor screenshot...");
    await page.goto('http://localhost:5173/candidate/code/editor', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000); // give it an extra 2s just in case
    await page.screenshot({ path: '../../screenshots/coding-editor.png' });

    await browser.disconnect();
    await chrome.kill();
    console.log("Screenshots saved successfully.");
})();
