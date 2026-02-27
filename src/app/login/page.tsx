'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { Lock, User } from 'lucide-react'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await login(username, pin)
        if (res.success) {
            if (res.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/')
            }
            router.refresh()
        } else {
            setError(res.error || 'Greška pri prijavi')
            setLoading(false)
        }
    }

    return (
        <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 className="section-title" style={{ justifyContent: 'center', marginBottom: '2rem' }}>Prijava</h1>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Korisničko ime</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="Unesite username"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>PIN Kod (4 cifre)</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                required
                                maxLength={4}
                                style={{ paddingLeft: '2.5rem', letterSpacing: '0.2em' }}
                                placeholder="••••"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Prijavljivanje...' : 'Prijavi se'}
                    </button>
                </form>
            </div>
        </div>
    )
}
