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
  requestAccount: t.fieldWithInput({
    type: 'Boolean',
    input: {
      reason: t.input.stringList(),
      role: t.input.stringList(),
      firstName: t.input.string(),
      lastName: t.input.string(),
      jobTitle: t.input.string({ required: false }),
      email: t.input.string(),
      phone: t.input.string({ required: false }),
      schoolName: t.input.string(),
      state: t.input.string(),
      students: t.input.int(),
      schoolType: t.input.string(),
      comments: t.input.string({ required: false }),
    },
    resolve: async (obj, { input }) => {
      if (!config.requestAccountEmail) {
        return false
      }

      const to = config.requestAccountEmail.split(',')

      sendEmailTemplate(
        to,
        'request-account',
        {
          reason: input.reason.join(', '),
          role: input.role.join(', '),
          firstName: input.firstName,
          lastName: input.lastName,
          jobTitle: input.jobTitle,
          email: input.email,
          phone: input.phone,
          schoolName: input.schoolName,
          state: input.state,
          students: input.students,
          schoolType: input.schoolType,
          comments: input.comments,
        },
        {}
      )

      return true
    },
  }),
}))
