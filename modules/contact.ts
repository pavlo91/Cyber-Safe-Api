import config from '../config'
import pothos from '../libs/pothos'
import { sendEmailTemplate } from '../utils/email'

pothos.mutationFields((t) => ({
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
      if (!config.contactEmail) {
        return false
      }

      const to = config.contactEmail.split(',')

      sendEmailTemplate(
        to,
        'contact',
        {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          jobTitle: input.jobTitle,
          schoolName: input.schoolName,
          state: input.state,
          students: input.students,
          describe: input.describe,
          comments: input.comments,
        },
        {}
      )

      return true
    },
  }),
}))
