const fs = require('fs')
const path = require('path')
const PixelDiff = require('pixel-diff')

const IMAGE_FORMAT = 'png'

async function compareSnapshot(
  fixturePath,
  { outputPath, referencePath, testPath }
) {
  const diff = new PixelDiff({
    imageAPath: path.resolve(referencePath, fixturePath),
    imageBPath: path.resolve(testPath, fixturePath),
    imageOutputPath: path.resolve(outputPath, `${fixturePath}.${IMAGE_FORMAT}`),
    imageOutput: PixelDiff.OUTPUT_SIMILAR,
    thresholdType: PixelDiff.THRESHOLD_PERCENT,
    threshold: 0.01, // 1% threshold
  })

  return diff.runWithPromise()
}

async function command({ outputPath, referencePath, testPath }) {
  const fixtures = fs.readdirSync(path.resolve(referencePath))

  console.log('Starting comparison...')

  for (let fixturePath of fixtures) {
    console.log(`Comparing ${fixturePath}`)

    await compareSnapshot(fixturePath, { outputPath, referencePath, testPath })
  }
}

module.exports = command
