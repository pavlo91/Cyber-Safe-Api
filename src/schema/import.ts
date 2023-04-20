import ExcelJS from 'exceljs'
import { hasRoleInSchoolId } from '../helpers/auth'
import { storageGetTempUploadStream } from '../libs/storage'
import { prisma } from '../prisma'
import { builder } from './builder'
import { createUserRoleIfNone } from './user-role'

type PreviewImportRow = { values: string[] }
export const PreviewImportRow = builder.objectRef<PreviewImportRow>('PreviewImportRow')

type PreviewImport = { headers: string[]; rows: PreviewImportRow[] }
export const PreviewImport = builder.objectRef<PreviewImport>('PreviewImport')

PreviewImportRow.implement({
  fields: (t) => ({
    values: t.exposeStringList('values'),
  }),
})

PreviewImport.implement({
  fields: (t) => ({
    headers: t.exposeStringList('headers'),
    rows: t.expose('rows', { type: [PreviewImportRow] }),
  }),
})

export const PreviewImportTypeEnum = builder.enumType('PreviewImportTypeEnum', {
  values: ['CSV', 'EXCEL'] as const,
})

type ImportStudentsAndParentsHeader = { studentEmail: string; parentEmail: string }
export const ImportStudentsAndParentsHeader = builder.inputRef<ImportStudentsAndParentsHeader>(
  'ImportStudentsAndParentsHeader'
)

ImportStudentsAndParentsHeader.implement({
  fields: (t) => ({
    studentEmail: t.string(),
    parentEmail: t.string(),
  }),
})

async function parseUpload(uploadId: string, type: 'CSV' | 'EXCEL') {
  const upload = await prisma.upload.findUniqueOrThrow({
    where: { id: uploadId },
  })

  const { stream } = await storageGetTempUploadStream(upload.blobName)

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

builder.mutationFields((t) => ({
  previewImport: t.fieldWithInput({
    type: PreviewImport,
    authScopes: { user: true },
    input: {
      uploadId: t.input.id(),
      type: t.input.field({ type: PreviewImportTypeEnum }),
    },
    resolve: (obj, { input: { uploadId, type } }) => {
      return parseUpload(uploadId, type)
    },
  }),
  importStudentsAndParents: t.fieldWithInput({
    authScopes: (obj, { schoolId }, { user }) => {
      if (hasRoleInSchoolId(schoolId, user, ['ADMIN', 'COACH'])) {
        return true
      }

      return { staff: true }
    },
    type: 'Boolean',
    args: {
      schoolId: t.arg.id(),
    },
    input: {
      uploadId: t.input.id(),
      type: t.input.field({ type: PreviewImportTypeEnum }),
      header: t.input.field({ type: ImportStudentsAndParentsHeader }),
    },
    resolve: async (obj, { schoolId, input: { uploadId, type, header } }) => {
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
              name: '',
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
                name: '',
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
