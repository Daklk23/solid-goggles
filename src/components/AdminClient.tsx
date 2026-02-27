'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createUser, deleteUser } from '@/app/actions/users'
import { scanAndImportSchedule } from '@/app/actions/ai'
import { useRouter } from 'next/navigation'

export default function AdminClient({ users }: { users: any[] }) {
    const [username, setUsername] = useState('')
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // AI Scanning state
    const [aiLoading, setAiLoading] = useState(false)
    const [aiMessage, setAiMessage] = useState({ text: '', type: '' }) // type: 'success' | 'error' | ''

    const router = useRouter()

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (pin.length !== 4) {
                throw new Error('PIN mora imati tačno 4 cifre')
            }
            await createUser(username, pin)
            setUsername('')
            setPin('')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Greška pri kreiranju korisnika. Možda username već postoji.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Da li ste sigurni da želite da obrišete korisnika? Sve njegove stavke će biti obrisane.')) return

        try {
            await deleteUser(id)
            router.refresh()
        } catch (err) {
            alert('Greška pri brisanju')
        }
    }

    const handleAIUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setAiLoading(true)
        setAiMessage({ text: 'Skeniram sliku rasporeda... (ovo može potrajati par sekundi)', type: 'info' })

        try {
            const buffer = await file.arrayBuffer()
            // Pretvaramo u base64 string
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64Image = window.btoa(binary);

            const result = await scanAndImportSchedule(base64Image, file.type)
            setAiMessage({ text: `Uspešno dodato ${result.count} časova!`, type: 'success' })
            router.refresh()
        } catch (err: any) {
            setAiMessage({ text: err.message || 'Greška', type: 'error' })
        } finally {
            setAiLoading(false)
            // Očistimo input da može ista slika ponovo
            e.target.value = ''
        }
    }

    return (
        <div className="page-container" style={{ maxWidth: '800px' }}>
            <h1 className="section-title">Admin Panel</h1>

            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Dodaj novog korisnika (učenika)</h2>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Korisničko ime</label>
                        <input required type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Npr. PetarPetrovic" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>PIN (4 cifre)</label>
                        <input required type="text" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} pattern="\d{4}" placeholder="1234" />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ height: '46px', marginBottom: '2px' }}>
                        <Plus size={18} /> Dodaj
                    </button>
                </form>
            </div>

            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Gemini AI Skeniranje Rasporeda (Beta)</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Slikajte vaš raspored i dozvolite Google Gemini veštačkoj inteligenciji da ga prepozna i automatski upiše u celokupni školski (javni) raspored na sajtu.
                </p>

                {aiMessage.text && (
                    <div style={{
                        background: aiMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : aiMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: aiMessage.type === 'error' ? 'var(--danger)' : aiMessage.type === 'success' ? '#fff' : 'var(--text-primary)',
                        padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
                        border: aiMessage.type === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : aiMessage.type === 'success' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        {aiMessage.text}
                    </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'inline-block', cursor: aiLoading ? 'not-allowed' : 'pointer', background: 'var(--accent-primary)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, opacity: aiLoading ? 0.7 : 1 }}>
                        {aiLoading ? 'Skeniranje u toku...' : 'Izaberi sliku / Slikaj raspored'}
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleAIUpload}
                            disabled={aiLoading}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </div>

            <div className="glass-panel slide-up">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Lista korisnika ({users.length})</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {users.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                            Nema dodatih korisnika
                        </div>
                    ) : users.map(user => (
                        <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.username}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                    <span>PIN: <strong style={{ color: 'var(--text-primary)', letterSpacing: '0.1em' }}>{user.pin}</strong></span>
                                    <span>Dodat: {new Date(user.createdAt).toLocaleDateString('sr')}</span>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(user.id)} className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Trash2 size={16} /> Obriši
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
