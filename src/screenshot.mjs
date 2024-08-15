import "dotenv/config";
import puppeteer from "puppeteer-core";

export async function takeScreenshot(params) {
  const { url, width, height, hideElements = [] } = params;
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_EXECUTABLE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
    );
    await page.setViewport({ width, height });
    await page.goto(url, {
      waitUntil: ["networkidle2", "load"],
      timeout: 15000,
    });
    await maybeHideElements(page, hideElements);

    const base64 = await page.screenshot();

    return base64;
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
}

async function maybeHideElements(page, selectors) {
  if (selectors.length === 0) {
    return;
  }

  await Promise.all(
    selectors.map((selector) => {
      return page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => element.remove());
      }, selector);
    })
  );
}
