'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import ScheduleView from '@/components/ScheduleView'
import EventsList from '@/components/EventsList'
import AddItemModal from '@/components/AddItemModal'
import { useRouter } from 'next/navigation'
import { createPersonalItem, createPublicItem, deletePersonalItem, deletePublicItem } from '@/app/actions/items'

export default function DashboardClient({ publicItems, personalItems, session }: { publicItems: any[], personalItems: any[], session: any }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('SCHEDULE') // SCHEDULE or EVENTS
    const [prefilledDay, setPrefilledDay] = useState('1')
    const [prefilledType, setPrefilledType] = useState('SCHEDULE_SLOT')
    const router = useRouter()

    const isAdmin = session?.role === 'admin'
    const isUser = session?.role === 'user'
    const isLoggedIn = !!session

    const handleAdd = async (data: any) => {
        try {
            if (isAdmin) {
                await createPublicItem(data)
            } else if (isUser) {
                await createPersonalItem(data)
            }
            router.refresh()
        } catch (e) {
            alert('Došlo je do greške.')
        }
    }

    const handleDelete = async (id: string, isPublic: boolean) => {
        if (!confirm('Da li ste sigurni da želite da obrišete ovu stavku?')) return

        try {
            if (isPublic && isAdmin) {
                await deletePublicItem(id)
            } else if (!isPublic && isUser) {
                await deletePersonalItem(id)
            }
            router.refresh()
        } catch (e) {
            alert('Došlo je do greške.')
        }
    }

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Dobrodošli{session?.role === 'admin' ? ', Administrator' : session?.role === 'user' ? ', Korisniče' : ''}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        {isLoggedIn ? 'Vaš personalizovani školski priručnik i raspored.' : 'Prijavite se da biste personalizovali svoj raspored.'}
                    </p>
                </div>

                {isLoggedIn && (
                    <button className="btn-primary" onClick={() => {
                        setPrefilledDay('1')
                        setPrefilledType('SCHEDULE_SLOT')
                        setModalOpen(true)
                    }}>
                        <Plus size={20} /> Dodaj
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setActiveTab('SCHEDULE')}
                    style={{ padding: '1rem 2rem', background: 'transparent', color: activeTab === 'SCHEDULE' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'SCHEDULE' ? 600 : 400, borderBottom: activeTab === 'SCHEDULE' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}>
                    Raspored časova
                </button>
                <button
                    onClick={() => setActiveTab('EVENTS')}
                    style={{ padding: '1rem 2rem', background: 'transparent', color: activeTab === 'EVENTS' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'EVENTS' ? 600 : 400, borderBottom: activeTab === 'EVENTS' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}>
                    Provere i projekti
                </button>
            </div>

            <div className="glass-panel slide-up" style={{ padding: '2rem' }}>
                {activeTab === 'SCHEDULE' ? (
                    <ScheduleView
                        publicItems={publicItems}
                        personalItems={personalItems}
                        isAdmin={isAdmin}
                        isUser={isUser}
                        onDelete={handleDelete}
                        onAddClick={(dayIdx) => {
                            setPrefilledDay((dayIdx + 1).toString())
                            setPrefilledType('SCHEDULE_SLOT')
                            setModalOpen(true)
                        }}
                    />
                ) : (
                    <EventsList publicItems={publicItems} personalItems={personalItems} isAdmin={isAdmin} isUser={isUser} onDelete={handleDelete} />
                )}
            </div>

            <AddItemModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} initialType={prefilledType} initialDay={prefilledDay} />
        </div>
    )
}
