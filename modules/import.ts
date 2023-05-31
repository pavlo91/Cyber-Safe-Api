import ExcelJS from 'exceljs'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import storage from '../libs/storage'
import { checkAuth, hasRoleInSchool, isStaff, isUser } from '../utils/auth'
import { createUserRoleIfNone } from './user-role'

type PreviewImportRow = { values: string[] }
export const GQLPreviewImportRow = pothos.objectRef<PreviewImportRow>('PreviewImportRow')

type PreviewImport = { headers: string[]; rows: PreviewImportRow[] }
export const GQLPreviewImport = pothos.objectRef<PreviewImport>('PreviewImport')

GQLPreviewImportRow.implement({
  fields: (t) => ({
    values: t.exposeStringList('values'),
  }),
})

GQLPreviewImport.implement({
  fields: (t) => ({
    headers: t.exposeStringList('headers'),
    rows: t.expose('rows', { type: [GQLPreviewImportRow] }),
  }),
})

export const GQLPreviewImportTypeEnum = pothos.enumType('PreviewImportTypeEnum', {
  values: ['CSV', 'EXCEL'] as const,
})

type ImportStudentsAndParentsHeader = { studentEmail: string; parentEmail: string }
export const GQLImportStudentsAndParentsHeader = pothos.inputRef<ImportStudentsAndParentsHeader>(
  'ImportStudentsAndParentsHeader'
)

GQLImportStudentsAndParentsHeader.implement({
  fields: (t) => ({
    studentEmail: t.string(),
    parentEmail: t.string(),
  }),
})

async function parseUpload(uploadId: string, type: 'CSV' | 'EXCEL') {
  const upload = await prisma.upload.findUniqueOrThrow({
    where: { id: uploadId },
  })

  const stream = await storage.getStream(upload.blobURL)

  const workbook = new ExcelJS.Workbook()

  let worksheet: ExcelJS.Worksheet

  switch (type) {
    case 'CSV':
      worksheet = await workbook.csv.read(stream)
      break
    case 'EXCEL':
      await workbook.xlsx.read(stream)
      worksheet = workbook.worksheets[0]
      break
  }

  const result: PreviewImport = {
    headers: [],
    rows: [],
  }

  worksheet.eachRow((row, index) => {
    const values: string[] = []

    row.eachCell((cell) => {
      const value = cell.value

      if (typeof value === 'string') {
        values.push(value)
      } else if (typeof value === 'object' && value !== null) {
        if ('hyperlink' in value && typeof value.hyperlink === 'string') {
          if (value.hyperlink.startsWith('mailto:')) {
            values.push(value.hyperlink.substring(7))
          } else {
            values.push(value.hyperlink)
          }
        }
      } else {
        values.push(String(value))
      }
    })

    if (index === 1) {
      result.headers = values
    } else {
      result.rows.push({ values })
    }
  })

  return result
}

pothos.mutationFields((t) => ({
  previewImport: t.fieldWithInput({
    type: GQLPreviewImport,
    input: {
      uploadId: t.input.id(),
      type: t.input.field({ type: GQLPreviewImportTypeEnum }),
    },
    resolve: async (obj, { input: { uploadId, type } }, { user }) => {
      await checkAuth(() => isUser(user))

      return await parseUpload(uploadId, type)
    },
  }),
  importStudentsAndParents: t.fieldWithInput({
    type: 'Boolean',
    args: {
      schoolId: t.arg.id(),
    },
    input: {
      uploadId: t.input.id(),
      type: t.input.field({ type: GQLPreviewImportTypeEnum }),
      header: t.input.field({ type: GQLImportStudentsAndParentsHeader }),
    },
    resolve: async (obj, { schoolId, input: { uploadId, type, header } }, { user }) => {
      await checkAuth(
        () => hasRoleInSchool(schoolId, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      const data = await parseUpload(uploadId, type)

      const atheleteEmailsHeaderIndex = data.headers.findIndex((e) => e === header.studentEmail)
      const parentEmailsHeaderIndex = data.headers.findIndex((e) => e === header.parentEmail)

      const rows = data.rows.map(({ values }) => ({
        studentEmail: values[atheleteEmailsHeaderIndex],
        parentEmail: values[parentEmailsHeaderIndex],
      }))

      for (const row of rows) {
        if (!row.studentEmail) {
          throw new Error('Found empty Athelete E-mail value')
        }

        let student = await prisma.user.findUnique({
          where: { email: row.studentEmail },
        })

        if (!student) {
          student = await prisma.user.create({
            data: {
              email: row.studentEmail,
              name: row.studentEmail,
            },
          })
        }

        await createUserRoleIfNone({
          type: 'STUDENT',
          userId: student.id,
          schoolRole: { schoolId },
        })

        if (!!row.parentEmail) {
          let parent = await prisma.user.findUnique({
            where: { email: row.parentEmail },
          })

          if (!parent) {
            parent = await prisma.user.create({
              data: {
                email: row.parentEmail,
                name: row.parentEmail,
              },
            })
          }

          await createUserRoleIfNone({
            type: 'PARENT',
            userId: parent.id,
            parentRole: { childUserId: student.id },
          })
        }
      }

      return true
    },
  }),
}))
