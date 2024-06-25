const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 54321;

app.get('/screenshot', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        res.status(400).send('URL is required');
        return;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(60*1000);
    page.setDefaultNavigationTimeout(60*1000);
    // Set screen size.
    await page.setViewport({width: 1920, height: 1080});
    try {
        await page.goto(url, {waitUntil: 'networkidle2','timeout': 1000*60});
        await page.waitForNetworkIdle({'timeout': 1000*60});
        const screenshot = await page.screenshot({fullPage: true,quality: 100});
        res.type('image/png');
        res.send(screenshot);
    } catch (e) {
        res.sendStatus(-1);
        res.send(e);
    } finally {
        browser.close();
    }
});

app.listen(port, () => {
    console.log(`Puppeteer service listening at http://localhost:${port}`);
});
