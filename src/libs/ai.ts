import Prisma from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { prisma } from '../prisma'

const blocklistDir = path.join(__dirname, '../../blocklist')
const fileNames = ['racial.txt', 'suicide.txt']
const filePaths = fileNames.map((name) => path.join(blocklistDir, name))

function checkText(text: string) {
  for (const filePath of filePaths) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n')

    for (const line of lines) {
      if (text.toLowerCase().includes(line)) {
        return true
      }
    }
  }

  return false
}

async function flagAnalysisModel(model: Prisma.AnalysisModel) {
  await prisma.analysisModel.update({
    where: { id: model.id },
    data: { flagged: true },
  })
}

export async function analyseTextFromPost(post: Prisma.Post) {
  const analysis = await prisma.analysis.upsert({
    update: {},
    where: { postId: post.id },
    create: { postId: post.id },
  })

  const model = await prisma.analysisModel.create({
    data: {
      type: 'TEXT',
      source: post.blobName!,
      analysisId: analysis.id,
    },
  })

  // Step 1 - check text with a set of words
  if (checkText(post.text)) {
    await flagAnalysisModel(model)
  }

  // TODO:
}
