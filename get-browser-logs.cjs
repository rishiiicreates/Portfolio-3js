const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => {
        console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
        console.error(`[Browser Page Error] ${err.toString()}`);
    });

    try {
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    } catch (e) {
        console.error('Error navigating:', e);
    }
    await browser.close();
})();
