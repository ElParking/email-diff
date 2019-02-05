const fs = require('fs')
const path = require('path')
const URL = require('url')
const puppeteer = require('puppeteer')

const IMAGE_FORMAT = 'png'

function ensureScreenshotsPath(screenshotsPath) {
  if (!fs.existsSync(path.resolve(screenshotsPath))) {
    fs.mkdirSync(path.resolve(screenshotsPath))
  }
}

async function getScreenshotsPaths(browser, host) {
  const page = await browser.newPage()

  await page.goto(host, { waitUntil: 'load' })
  const hrefs = await page.$$eval('a', (hrefs) => hrefs.map((a) => a.href))
  await page.close()

  return hrefs
}

async function takeScreenshot(browser, url, screenshotsPath) {
  const page = await browser.newPage()

  await page.goto(url)
  await page.screenshot({
    path: path.resolve(
      path.join(screenshotsPath, `${URL.parse(url).pathname}.${IMAGE_FORMAT}`)
    ),
    fullPage: true,
  })
  await page.close()
}

async function command({ host, headless, screenshotsPath }) {
  ensureScreenshotsPath(screenshotsPath)

  console.log(`Screenshots dir: ${screenshotsPath}`)
  console.log()

  console.log('Launching puppeteer...')
  const browser = await puppeteer.launch({
    headless,
  })
  const snapshotsPaths = await getScreenshotsPaths(browser, host)

  for (let fixturePath of snapshotsPaths) {
    console.log(`Saving ${fixturePath}`)

    await takeScreenshot(browser, fixturePath, screenshotsPath)
  }

  await browser.close()
}

module.exports = command
