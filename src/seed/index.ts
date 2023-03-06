import { seedAuth } from './1-auth'
import { seedSchools } from './2-schools'
import { seedParents } from './3-parents'

async function main() {
  await seedAuth()
  await seedSchools()
  await seedParents()
}

main()
