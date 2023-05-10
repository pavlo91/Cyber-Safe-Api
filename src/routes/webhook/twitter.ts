import { z } from 'zod'
import { fastify } from '../fastify'

// https://developer.twitter.com/en/docs/twitter-api/enterprise/account-activity-api/guides/account-activity-data-objects#tweet_create_events
const schema = z.object({
  for_user_id: z.string(),
  tweet_create_events: z.array(
    // https://developer.twitter.com/en/docs/twitter-api/v1/data-dictionary/object-model/tweet
    z.object({
      id_str: z.string(),
      created_at: z.string(),
      text: z.string(),
      // https://developer.twitter.com/en/docs/twitter-api/v1/data-dictionary/object-model/entities
      entities: z.object({
        media: z.array(
          // https://developer.twitter.com/en/docs/twitter-api/v1/data-dictionary/object-model/entities#media
          z.object({
            id_str: z.string(),
            media_url_https: z.string(),
            type: z.union([z.literal('photo'), z.literal('video'), z.literal('animated_gif')]),
          })
        ),
      }),
    })
  ),
})

// https://developer.twitter.com/en/docs/twitter-api/enterprise/account-activity-api/overview
fastify.post('/webhook/twitter', async (req, reply) => {
  const data = schema.parse(req.body)

  console.log(data)

  reply.send({ success: true })
})
