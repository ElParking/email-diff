const fs = require('fs')
const path = require('path')
const util = require('util')
const glob = require('glob')
const puppeteer = require('puppeteer')

const IMAGE_FORMAT = 'png'
const SNAPSHOT_EXTENSION = 'html'

const readFile = util.promisify(fs.readFile)
const makeDir = util.promisify(fs.mkdir)
const globDir = util.promisify(glob)

function resolveSnapshotPath(dir, snapshotName) {
  return path.resolve(dir, snapshotName)
}

async function ensureScreenshotsDir(dir) {
  try {
    await makeDir(path.resolve(dir))
  } catch (error) {
    if (error.code === 'EEXIST') {
      return
    }

    throw error
  }
}

async function fetchSnapshot(snapshotPath) {
  return await readFile(snapshotPath, { encoding: 'utf8' })
}

async function getSnapshots(dir) {
  return await globDir(`*.${SNAPSHOT_EXTENSION}`, { cwd: path.resolve(dir) })
}

async function takeScreenshot(page, html, screenshotPath) {
  console.log(`Generating screenshot ${screenshotPath}`)

  await page.setContent(html, { waitUntil: 'load' })
  await page.screenshot({
    path: `${screenshotPath}.${IMAGE_FORMAT}`,
    type: IMAGE_FORMAT,
    fullPage: true,
  })
}

async function command({ dir, outputDir, headless, max }) {
  await ensureScreenshotsDir(outputDir)

  const snapshots = await getSnapshots(dir)

  console.log('Launching puppeteer...')
  const browser = await puppeteer.launch({ headless })
  const page = await browser.newPage()

  for (let snapshotName of snapshots.slice(0, max)) {
    const html = await fetchSnapshot(resolveSnapshotPath(dir, snapshotName))

    await takeScreenshot(
      page,
      html,
      resolveSnapshotPath(outputDir, snapshotName)
    )
  }

  await browser.close()
}

module.exports = command
