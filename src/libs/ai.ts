import Prisma from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { prisma } from '../prisma'
import { sendEmail } from './postmark'

const files = ['racial.txt', 'suicide.txt']
const paths = files.map((name) => path.join(__dirname, '../../blocklist', name))
const lines = paths.flatMap((path) => fs.readFileSync(path, 'utf8').split('\n'))

function containsBlocklisted(text: string) {
  const normalizedText = text.toLowerCase()

  for (const line of lines) {
    if (normalizedText.includes(line)) {
      return true
    }
  }

  return false
}

async function flagAnalysisModel(
  model: Prisma.Prisma.AnalysisModelGetPayload<{ include: { analysis: true } }>,
  userId: string
) {
  await prisma.analysisModel.update({
    where: { id: model.id },
    data: { flagged: true },
  })

  const schoolRoles = await prisma.schoolRole.findMany({
    where: {
      userRole: {
        userId,
        status: 'ACCEPTED',
      },
    },
    include: {
      userRole: {
        include: {
          user: true,
        },
      },
    },
  })

  if (schoolRoles.length === 0) {
    return
  }

  const coachRoles = await prisma.schoolRole.findMany({
    where: {
      schoolId: { in: schoolRoles.map((e) => e.schoolId) },
      userRole: {
        type: 'COACH',
        status: 'ACCEPTED',
      },
    },
    include: {
      userRole: {
        include: {
          user: true,
        },
      },
    },
  })

  if (coachRoles.length === 0) {
    return
  }

  sendEmail(
    coachRoles.map((e) => e.userRole.user.email),
    'post-flagged',
    schoolRoles[0].userRole.user.name || schoolRoles[0].userRole.user.email,
    model.analysis.postId
  )
}

export async function analyseTextFromPost(post: Prisma.Post, userId: string) {
  const analysis = await prisma.analysis.upsert({
    update: {},
    where: { postId: post.id },
    create: { postId: post.id },
  })

  const model = await prisma.analysisModel.create({
    include: { analysis: true },
    data: {
      type: 'TEXT',
      source: post.blobName!,
      analysisId: analysis.id,
    },
  })

  // Step 1 - check text with a set of words
  if (containsBlocklisted(post.text)) {
    await flagAnalysisModel(model, userId)
  }

  // TODO: Step 2
}
