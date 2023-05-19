import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend'
import {
  DetectModerationLabelsCommand,
  GetContentModerationCommand,
  ModerationLabel,
  RekognitionClient,
  StartContentModerationCommand,
} from '@aws-sdk/client-rekognition'
import fs from 'fs'
import path from 'path'
import config from '../config'
import storage from './storage'

export type ModeratorResult =
  | { status: 'flagged'; reason: string }
  | { status: 'in_progress'; jobId: string }
  | { status: 'not_flagged' }

// TODO: rename prisma blobname to bloburl
interface Moderator {
  analyzeText(text: string): Promise<ModeratorResult>
  analyzeImage(blobURL: string): Promise<ModeratorResult>
  analyzeVideo(blobURL: string): Promise<ModeratorResult>
  finishJobId(jobId: string): Promise<ModeratorResult>
}

class LocalModerator implements Moderator {
  private blocklist: { reason: string; words: string[] }[]

  constructor() {
    let files = [
      { path: 'racial-words.txt', reason: 'Blocklisted Racial Word' },
      { path: 'suicide-words.txt', reason: 'Blocklisted Suicide Word' },
    ]

    files = files.map((file) => ({ ...file, path: path.join(__dirname, '../static/' + file.path) }))

    this.blocklist = files.map((file) => ({
      reason: file.reason,
      words: fs
        .readFileSync(file.path, 'utf8')
        .split('\n')
        .map((word) => word.trim().toLowerCase()),
    }))
  }

  async analyzeText(text: string): Promise<ModeratorResult> {
    const lowercaseText = text.toLowerCase()

    for (const blocklist of this.blocklist) {
      for (const word of blocklist.words) {
        if (lowercaseText.includes(word)) {
          return { status: 'flagged', reason: blocklist.reason }
        }
      }
    }

    return { status: 'not_flagged' }
  }

  async analyzeImage(blobURL: string): Promise<ModeratorResult> {
    return { status: 'not_flagged' }
  }

  async analyzeVideo(blobURL: string): Promise<ModeratorResult> {
    return { status: 'not_flagged' }
  }

  async finishJobId(jobId: string): Promise<ModeratorResult> {
    return { status: 'not_flagged' }
  }
}

class AmazonModerator implements Moderator {
  private comprehendClient: ComprehendClient
  private rekognitionClient: RekognitionClient

  constructor(private config: { region: string; accessKey: string; secretKey: string; labels: string[] }) {
    this.comprehendClient = new ComprehendClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    })

    this.rekognitionClient = new RekognitionClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    })
  }

  async analyzeText(text: string): Promise<ModeratorResult> {
    const sentiment = await this.comprehendClient.send(
      new DetectSentimentCommand({
        Text: text,
        LanguageCode: 'en',
      })
    )

    if (sentiment.SentimentScore?.Negative && sentiment.SentimentScore.Negative > 0.75) {
      return { status: 'flagged', reason: `Negativity` }
    }

    return { status: 'not_flagged' }
  }

  private formatReason(moderationLabels: ModerationLabel[]) {
    const reasons = moderationLabels.map((e) => [e.ParentName, e.Name].filter((e) => !!e).join('/')).filter((e) => !!e)
    return [...new Set(reasons)].join(', ')
  }

  private containsModerationLabel(moderationLabels: ModerationLabel[]) {
    for (const label of moderationLabels) {
      const foundLabel = this.config.labels.find((e) => {
        const [parentName, name] = e.split('/')
        return (label.ParentName === parentName || parentName === '*') && (label.Name === name || name === '*')
      })

      if (foundLabel) {
        return true
      }
    }

    return false
  }

  async analyzeImage(blobURL: string): Promise<ModeratorResult> {
    const { container, blob } = storage.parseBlobURL(blobURL)

    const moderation = await this.rekognitionClient.send(
      new DetectModerationLabelsCommand({
        Image: {
          S3Object: {
            Name: blob,
            Bucket: container,
          },
        },
      })
    )

    if (moderation.ModerationLabels && this.containsModerationLabel(moderation.ModerationLabels)) {
      return {
        status: 'flagged',
        reason: this.formatReason(moderation.ModerationLabels),
      }
    }

    return { status: 'not_flagged' }
  }

  async analyzeVideo(blobURL: string): Promise<ModeratorResult> {
    const { container, blob } = storage.parseBlobURL(blobURL)

    const moderation = await this.rekognitionClient.send(
      new StartContentModerationCommand({
        Video: {
          S3Object: {
            Name: blob,
            Bucket: container,
          },
        },
      })
    )

    if (moderation.JobId) {
      return { status: 'in_progress', jobId: moderation.JobId }
    }

    return { status: 'not_flagged' }
  }

  async finishJobId(jobId: string): Promise<ModeratorResult> {
    const moderation = await this.rekognitionClient.send(
      new GetContentModerationCommand({
        JobId: jobId,
      })
    )

    if (moderation.JobStatus === 'SUCCEEDED') {
      if (
        moderation.ModerationLabels &&
        this.containsModerationLabel(
          moderation.ModerationLabels.filter((e) => !!e.ModerationLabel).map((e) => e.ModerationLabel!)
        )
      ) {
        return {
          status: 'flagged',
          reason: this.formatReason(moderation.ModerationLabels.map((e) => e.ModerationLabel ?? {})),
        }
      }
    } else if (moderation.JobStatus === 'FAILED') {
      throw new Error(moderation.StatusMessage)
    }

    return { status: 'not_flagged' }
  }
}

class MultiModerator implements Moderator {
  private moderators: Moderator[] = []

  addModerator(moderator: Moderator) {
    this.moderators.push(moderator)
  }

  async analyzeText(text: string): Promise<ModeratorResult> {
    for (const moderator of this.moderators) {
      const result = await moderator.analyzeText(text)

      if (result.status !== 'not_flagged') {
        return result
      }
    }

    return { status: 'not_flagged' }
  }

  async analyzeImage(blobURL: string): Promise<ModeratorResult> {
    for (const moderator of this.moderators) {
      const result = await moderator.analyzeImage(blobURL)

      if (result.status !== 'not_flagged') {
        return result
      }
    }

    return { status: 'not_flagged' }
  }

  async analyzeVideo(blobURL: string): Promise<ModeratorResult> {
    for (const moderator of this.moderators) {
      const result = await moderator.analyzeVideo(blobURL)

      if (result.status !== 'not_flagged') {
        return result
      }
    }

    return { status: 'not_flagged' }
  }

  async finishJobId(jobId: string): Promise<ModeratorResult> {
    for (const moderator of this.moderators) {
      const result = await moderator.finishJobId(jobId)

      if (result.status !== 'not_flagged') {
        return result
      }
    }

    return { status: 'not_flagged' }
  }
}

const moderator = new MultiModerator()

moderator.addModerator(new LocalModerator())

const { region, accessKey, secretKey, labels } = config.amazon.moderator

if (!!accessKey && !!secretKey) {
  moderator.addModerator(new AmazonModerator({ region, accessKey, secretKey, labels }))
}

export default moderator
