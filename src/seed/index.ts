import { seedAuth } from './1-auth'
import { seedSchools } from './2-schools'
import { seedParents } from './3-parents'
import { seedPosts } from './4-posts'

async function main() {
  await seedAuth()
  await seedSchools()
  await seedParents()
  await seedPosts()
}

main()
