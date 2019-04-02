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
  { referenceDir, testDir, outputDir, threshold }
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
    threshold: threshold,
  })

  return diff.runWithPromise()
}

async function command({ referenceDir, testDir, outputDir, max, threshold }) {
  await ensureScreenshotsDir(outputDir)

  const snapshotsA = new Set(await getScreenshots(referenceDir))
  const snapshotsB = new Set(await getScreenshots(testDir))
  const snapshots = new Set(
    [...snapshotsA].filter((snapshot) => snapshotsB.has(snapshot)).slice(0, max)
  )

  if (snapshots.size === 0) {
    console.log(`Nothing to compare ¯\\_(ツ)_/¯`)
    return
  }

  console.log('Starting tests...\n')

  for (let snapshotName of snapshots) {
    try {
      await compareSnapshot(snapshotName, {
        referenceDir,
        testDir,
        outputDir,
        threshold,
      })
    } catch (error) {
      // Errors will be printed by PixelDiff instance
    }
  }
}

module.exports = command
