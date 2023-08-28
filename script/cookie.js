const { type } = require('os');
const fs = require('fs');
const puppeteer = require('puppeteer');

const osType = type();
const CACHED_COOKIES = {};

function hasBrowserAuthCookies(options) {
  const { target, expire } = options;
  if (!CACHED_COOKIES[target]) {
    return false;
  }
  if (expire && CACHED_COOKIES[target].time + expire < Date.now()) {
    return false;
  }
  return true;
}

async function fetchBrowserAuthCookies(options) {
  const { target, login, auto = 10000, chrome = true } = options;
  try {
    const launchOptions = {
      headless: !!auto,
    };
    if (chrome) {
      if (chrome === true && osType === 'Darwin') {
        launchOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      } else if (fs.existsSync(chrome)) {
        launchOptions.ignoreDefaultArgs = ['--disable-extensions'];
        launchOptions.executablePath = chrome;
      }
    }
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.goto(target, { waitUntil: 'networkidle0' });
    await login(page);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const cookies = await page.cookies();
    await browser.close();
    const cookieItems = [];
    cookies.forEach((cookie) => {
      const { name, value } = cookie;
      cookieItems.push(`${name}=${value}`);
    });
    const cookieStr = cookieItems.join('; ');
    CACHED_COOKIES[target] = {
      time: Date.now(),
      cookies: cookieStr,
    };
  } catch (e) {
    console.error(e);
  } finally {
    // 自动续约
    if (auto) {
      setTimeout(() => fetchBrowserAuthCookies(options), auto);
    }
  }
}

function getBrowserAuthCookies(options) {
  const { target } = options;
  if (!hasBrowserAuthCookies(options)) {
    fetchBrowserAuthCookies(options);
  }
  return CACHED_COOKIES[target].cookies;
}

module.exports = {
  getBrowserAuthCookies,
  fetchBrowserAuthCookies,
  hasBrowserAuthCookies,
};
