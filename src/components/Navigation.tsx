import Link from 'next/link'
import { BookOpen, Calendar, Shield, LogIn } from 'lucide-react'
import { getSession } from '@/app/actions/auth'
import LogoutButton from './LogoutButton'

export default async function Navigation() {
    const session = await getSession()

    return (
        <header className="header">
            <div className="nav-content">
                <Link href="/" className="logo">
                    <BookOpen className="text-accent" />
                    EduHub
                </Link>
                <nav className="nav-links">
                    <Link href="/" className="nav-link">
                        <Calendar size={18} style={{ marginRight: '6px', display: 'inline' }} />
                        Raspored
                    </Link>
                    {session?.role === 'admin' && (
                        <Link href="/admin" className="nav-link" style={{ color: 'var(--success)' }}>
                            <Shield size={18} style={{ marginRight: '6px', display: 'inline' }} />
                            Admin
                        </Link>
                    )}
                    {session ? (
                        <LogoutButton />
                    ) : (
                        <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                            <LogIn size={18} /> Prijava
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
