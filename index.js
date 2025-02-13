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

function parseBoolean(arg){
    let strArg = arg.toString();
    return strArg.toLowerCase() == "true" || strArg == "1"; 
}


app.get('/screenshot', async (req, res) => {
    let url = req.query.url;
    if (!url) {
        res.status(400).send('URL is required');
        return;
    }
    //做一次解码，外部最好做一次编码，避免目标url的参数变成服务参数
    url = decodeURIComponent(url);
    const fullPage = req.query.fullPage;
    console.log("fullPage="+fullPage);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);
    await page.setViewport({width: 2560, height: 1440});
    try {
        await page.goto(url, {waitUntil: 'networkidle2','timeout': timeout});
        await page.waitForNetworkIdle({'timeout': timeout});
        const screenshot = await page.screenshot({fullPage: parseBoolean(fullPage)});
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
