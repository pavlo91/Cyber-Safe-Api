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

type ImportAthletesAndParentsHeader = { athleteEmail: string; parentEmail: string }
export const ImportAthletesAndParentsHeader = builder.inputRef<ImportAthletesAndParentsHeader>(
  'ImportAthletesAndParentsHeader'
)

ImportAthletesAndParentsHeader.implement({
  fields: (t) => ({
    athleteEmail: t.string(),
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
  importAthletesAndParents: t.fieldWithInput({
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
      header: t.input.field({ type: ImportAthletesAndParentsHeader }),
    },
    resolve: async (obj, { schoolId, input: { uploadId, type, header } }) => {
      const data = await parseUpload(uploadId, type)

      const atheleteEmailsHeaderIndex = data.headers.findIndex((e) => e === header.athleteEmail)
      const parentEmailsHeaderIndex = data.headers.findIndex((e) => e === header.parentEmail)

      const rows = data.rows.map(({ values }) => ({
        athleteEmail: values[atheleteEmailsHeaderIndex],
        parentEmail: values[parentEmailsHeaderIndex],
      }))

      for (const row of rows) {
        let athlete = await prisma.user.findUnique({
          where: { email: row.athleteEmail },
        })

        if (!athlete) {
          athlete = await prisma.user.create({
            data: {
              email: row.athleteEmail,
              name: '',
            },
          })
        }

        await createUserRoleIfNone({
          type: 'ATHLETE',
          userId: athlete.id,
          schoolRole: { schoolId },
        })

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
          parentRole: { childUserId: athlete.id },
        })
      }

      return true
    },
  }),
}))
