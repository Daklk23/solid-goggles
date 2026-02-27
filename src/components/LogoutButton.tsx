'use client'

import { LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.push('/login')
        router.refresh()
    }

    return (
        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={18} style={{ marginRight: '6px', display: 'inline' }} />
            Odjava
        </button>
    )
}
