const express = require('express');
const puppeteer = require('puppeteer');
const os = require('os');  

const app = express();
const port = 54321;
const timeout = 120*1000;
  
function getLocalIP() {  
  const networkInterfaces = os.networkInterfaces();  
  for (const networkName of Object.keys(networkInterfaces)) {  
    const networkInterface = networkInterfaces[networkName];  
    for (const networkInterfaceDetail of networkInterface) {  
      if (networkInterfaceDetail.family === 'IPv4' && !networkInterfaceDetail.internal) {  
        return networkInterfaceDetail.address;  
      }  
    }  
  }  
  return 'localhost';  
}


app.get('/screenshot', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        res.status(400).send('URL is required');
        return;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);
    await page.setViewport({width: 2560, height: 1440});
    try {
        await page.goto(url, {waitUntil: 'networkidle2','timeout': timeout});
        await page.waitForNetworkIdle({'timeout': timeout});
        const screenshot = await page.screenshot({fullPage: true});
        res.type('image/png');
        res.send(screenshot);
    } catch (e) {
        res.status(500);
        res.send(e);
    } finally {
        browser.close();
    }
});

app.listen(port, () => {
    console.log(`Puppeteer service listening at http://${getLocalIP()}:${port}`);
});
