export type Templates = {
  confirm: {
    token: string
  }
  'reset-password': {
    token: string
  }
  'invite-staff': {
    token: string
  }
  'invite-member': {
    schoolName: string
    token: string
  }
  'invite-parent': {
    childName: string
    token: string
  }
  notification: {
    body: string
    url?: string
    title?: string
  }
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string | undefined | null
    jobTitle: string | undefined | null
    schoolName: string
    state: string
    students: string
    describe: string
    comments: string | undefined | null
  }
}
