import { execSync } from 'child_process';
import puppeteer from "puppeteer-core";
import fs from "fs";

const chromiumPath = execSync("which chromium").toString();

export async function takeScreenshot(params) {
  const { name, url, width, height } = params;
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // executablePath: chromiumPath,
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
