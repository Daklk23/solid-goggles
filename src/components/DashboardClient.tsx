'use client'

import { useState } from 'react'
import { Plus, Download } from 'lucide-react'
import ScheduleView from '@/components/ScheduleView'
import EventsList from '@/components/EventsList'
import AddItemModal from '@/components/AddItemModal'
import { useRouter } from 'next/navigation'
import { createPersonalItem, createPublicItem, deletePersonalItem, deletePublicItem, updatePersonalItem, updatePublicItem, deleteAllPublicItems, deleteAllPersonalItems } from '@/app/actions/items'

export default function DashboardClient({ publicItems, personalItems, session }: { publicItems: any[], personalItems: any[], session: any }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('SCHEDULE') // SCHEDULE or EVENTS
    const [prefilledDay, setPrefilledDay] = useState('1')
    const [prefilledType, setPrefilledType] = useState('SCHEDULE_SLOT')
    const [prefilledTime, setPrefilledTime] = useState('08:00')
    const [prefilledDate, setPrefilledDate] = useState('')
    const [editingItem, setEditingItem] = useState<any>(null)
    const router = useRouter()

    const getNextTimeForDay = (dayIndex: number) => {
        const slots = [...publicItems, ...personalItems]
            .filter(i => i.type === 'SCHEDULE_SLOT' && i.dayOfWeek === dayIndex + 1);

        if (slots.length === 0) return '08:00';

        const sorted = slots.sort((a, b) => (a.hour || '').localeCompare(b.hour || ''));
        const lastSlot = sorted[sorted.length - 1];
        if (!lastSlot.hour) return '08:00';

        const parts = lastSlot.hour.split(':');
        let hours = parseInt(parts[0], 10);
        let mins = parseInt(parts[1], 10);

        mins += 50; // 45 min cas + 5 min mali odmor
        if (mins >= 60) {
            hours += Math.floor(mins / 60);
            mins = mins % 60;
        }

        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    const isAdmin = session?.role === 'admin'
    const isUser = session?.role === 'user'
    const isLoggedIn = !!session

    const handleSave = async (data: any) => {
        try {
            if (editingItem) {
                if (isAdmin && !editingItem.userId) {
                    await updatePublicItem(editingItem.id, data)
                } else if (isUser && editingItem.userId) {
                    await updatePersonalItem(editingItem.id, data)
                }
            } else {
                if (isAdmin) {
                    await createPublicItem(data)
                } else if (isUser) {
                    await createPersonalItem(data)
                }
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

    const handleClearAll = async () => {
        if (!confirm('Da li ste sigurni da želite da obrišete CEO raspored (odnosi se na vaš nivo pristupa)? Ovo se ne može opozvati!')) return

        try {
            if (isAdmin) {
                await deleteAllPublicItems()
            } else if (isUser) {
                await deleteAllPersonalItems()
            }
            router.refresh()
        } catch (e) {
            alert('Došlo je do greške.')
        }
    }

    const handleExportCalendar = () => {
        const events = [...publicItems, ...personalItems].filter(i => i.type === 'EVENT')
        if (events.length === 0) {
            alert('Nema događaja za eksportovanje u kalendar.')
            return
        }

        const url = new URL('/api/calendar', window.location.origin)
        if (isUser && session?.userId) {
            url.searchParams.set('uid', session.userId)
        } else if (isAdmin) {
            url.searchParams.set('uid', 'admin')
        }

        const calendarLink = url.toString()

        navigator.clipboard.writeText(calendarLink).then(() => {
            alert('LINK JE KOPIRAN U KLIPBORD!\\n\\nSada otvorite Google Kalendar na računaru, idite na levu stranu kod "Other calendars" (Ostali kalendari) kliknite na "+" -> "From URL".\\n\\nNalepite kopirani link da biste se pretplatili! Svaki novi test će vam automatski iskakati.\\n\\nVaš link:\\n' + calendarLink)
        }).catch(() => {
            prompt('Kopirajte ovaj donji link i zalepite ga u Google Kalendar ("Add Calendar from URL"):', calendarLink)
        })
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
                        setEditingItem(null)
                        setPrefilledDay('1')
                        setPrefilledType('SCHEDULE_SLOT')
                        setPrefilledTime(getNextTimeForDay(0))
                        setPrefilledDate('')
                        setModalOpen(true)
                    }}>
                        <Plus size={20} /> Dodaj
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
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

                {activeTab === 'SCHEDULE' && (isAdmin || isUser) ? (
                    <button
                        onClick={handleClearAll}
                        className="btn-danger"
                        style={{ marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                        Očisti ceo raspored
                    </button>
                ) : activeTab === 'EVENTS' && (isAdmin || isUser) ? (
                    <button
                        onClick={handleExportCalendar}
                        className="btn-secondary"
                        style={{ marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Download size={14} /> Izvezi u Kalendar (.ics)
                    </button>
                ) : null}
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
                            setEditingItem(null)
                            setPrefilledDay((dayIdx + 1).toString())
                            setPrefilledType('SCHEDULE_SLOT')
                            setPrefilledTime(getNextTimeForDay(dayIdx))
                            setPrefilledDate('')
                            setModalOpen(true)
                        }}
                        onEditClick={(item) => {
                            setEditingItem(item)
                            setModalOpen(true)
                        }}
                    />
                ) : (
                    <EventsList
                        publicItems={publicItems}
                        personalItems={personalItems}
                        isAdmin={isAdmin}
                        isUser={isUser}
                        onDelete={handleDelete}
                        onEditClick={(item) => {
                            setEditingItem(item)
                            setModalOpen(true)
                        }}
                        onDayClick={(dateStr: string) => {
                            if (!isAdmin && !isUser) return;
                            setEditingItem(null)
                            setPrefilledType('EVENT')
                            setPrefilledDate(dateStr)
                            setModalOpen(true)
                        }}
                    />
                )}
            </div>

            <AddItemModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdd={handleSave}
                initialType={prefilledType}
                initialDay={prefilledDay}
                initialTime={prefilledTime}
                initialDate={prefilledDate}
                initialData={editingItem}
            />
        </div>
    )
}
