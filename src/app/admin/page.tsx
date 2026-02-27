import { getSession } from '@/app/actions/auth'
import { getUsers } from '@/app/actions/users'
import AdminClient from '@/components/AdminClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const session = await getSession()

    if (session?.role !== 'admin') {
        redirect('/')
    }

    const users = await getUsers()

    return <AdminClient users={users} />
}
