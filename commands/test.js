const fs = require('fs')
const path = require('path')
const util = require('util')
const glob = require('glob')
const PixelDiff = require('pixel-diff')

const IMAGE_FORMAT = 'png'
const SCREENSHOT_EXTENSION = 'png'

const makeDir = util.promisify(fs.mkdir)
const globDir = util.promisify(glob)

function resolveScreenshotPath(dir, snapshotName) {
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

async function getScreenshots(dir) {
  return await globDir(`*.${SCREENSHOT_EXTENSION}`, { cwd: path.resolve(dir) })
}

async function compareSnapshot(
  snapshotName,
  { referenceDir, testDir, outputDir }
) {
  console.log(`Comparing screenshot ${snapshotName}`)

  const diff = new PixelDiff({
    imageAPath: resolveScreenshotPath(referenceDir, snapshotName),
    imageBPath: resolveScreenshotPath(testDir, snapshotName),
    imageOutputPath: resolveScreenshotPath(
      outputDir,
      `${snapshotName}.${IMAGE_FORMAT}`
    ),
    imageOutputLimit: PixelDiff.OUTPUT_SIMILAR,
    thresholdType: PixelDiff.THRESHOLD_PERCENT,
    threshold: 0.01, // 1% threshold
  })

  return diff.runWithPromise()
}

async function command({ referenceDir, testDir, outputDir, max }) {
  await ensureScreenshotsDir(outputDir)

  const snapshots = await getScreenshots(referenceDir)

  console.log('Starting tests...\n')

  for (let snapshotName of snapshots.slice(0, max)) {
    await compareSnapshot(snapshotName, { referenceDir, testDir, outputDir })
  }
}

module.exports = command
