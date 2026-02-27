import { getPublicItems, getPersonalItems } from '@/app/actions/items'
import { getSession } from '@/app/actions/auth'
import DashboardClient from '@/components/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function TopLevelPage() {
  const session = await getSession()
  const publicItems = await getPublicItems()
  const personalItems = session?.role === 'user' ? await getPersonalItems() : []

  return (
    <DashboardClient
      publicItems={publicItems}
      personalItems={personalItems}
      session={session}
    />
  )
}
