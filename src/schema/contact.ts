import { config } from '../config'
import { sendEmail } from '../libs/postmark'
import { builder } from './builder'

builder.mutationFields((t) => ({
  contact: t.fieldWithInput({
    type: 'Boolean',
    input: {
      firstName: t.input.string(),
      lastName: t.input.string(),
      email: t.input.string(),
      phone: t.input.string({ required: false }),
      jobTitle: t.input.string({ required: false }),
      schoolName: t.input.string(),
      state: t.input.string(),
      students: t.input.string(),
      describe: t.input.string(),
      comments: t.input.string({ required: false }),
    },
    resolve: (obj, { input }) => {
      const to = config.email.contact.split(',')
      sendEmail(to, 'email/contact.pug', input)

      return true
    },
  }),
}))
