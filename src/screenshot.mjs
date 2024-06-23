import 'dotenv/config';
import puppeteer from "puppeteer-core";

export async function takeScreenshot(params) {
  const { name, url, width, height } = params;
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_EXECUTABLE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url);
    const base64 = await page.screenshot();

    return base64;
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
}
