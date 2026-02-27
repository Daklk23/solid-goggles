'use client'

import { Edit2 } from 'lucide-react'

const DAYS = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak']

export default function ScheduleView({ publicItems, personalItems, isAdmin, isUser, onDelete, onAddClick, onEditClick }: {
    publicItems: any[],
    personalItems: any[],
    isAdmin: boolean,
    isUser: boolean,
    onDelete: (id: string, isPublic: boolean) => Promise<void>,
    onAddClick: (dayIndex: number) => void,
    onEditClick: (item: any) => void
}) {
    const mergedSlots = [...publicItems, ...personalItems].filter(i => i.type === 'SCHEDULE_SLOT')

    const getEndTime = (startTime: string) => {
        if (!startTime) return '';
        const parts = startTime.split(':');
        let hours = parseInt(parts[0], 10);
        let mins = parseInt(parts[1], 10);

        mins += 45;
        if (mins >= 60) {
            hours += Math.floor(mins / 60);
            mins = mins % 60;
        }
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    const getSlotsForDay = (dayIndex: number) => {
        return mergedSlots.filter(s => s.dayOfWeek === dayIndex + 1).sort((a, b) => (a.hour || '').localeCompare(b.hour || ''))
    }

    return (
        <div className="schedule-grid">
            {DAYS.map((dayName, idx) => (
                <div key={idx} className="schedule-day">
                    <div className="schedule-day-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{dayName}</span>
                        {(isAdmin || isUser) && (
                            <button
                                onClick={() => onAddClick(idx)}
                                title="Dodaj na ovaj dan"
                                style={{ background: 'transparent', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid transparent', fontSize: '1.2rem', lineHeight: 1 }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                +
                            </button>
                        )}
                    </div>
                    {getSlotsForDay(idx).length === 0 ? (
                        <div
                            onClick={() => (isAdmin || isUser) ? onAddClick(idx) : null}
                            style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', paddingTop: '1rem', cursor: (isAdmin || isUser) ? 'pointer' : 'default', paddingBottom: '1rem' }}
                            onMouseEnter={(e) => { if (isAdmin || isUser) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--accent-primary)' } }}
                            onMouseLeave={(e) => { if (isAdmin || isUser) { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = '' } }}
                        >
                            - Slobodno -<br />
                            {(isAdmin || isUser) && <span style={{ fontSize: '0.7rem' }}>Klikni da dodaš</span>}
                        </div>
                    ) : getSlotsForDay(idx).map(slot => (
                        <div key={slot.id} className={`schedule-item ${slot.userId ? 'personal' : 'public'}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div>
                                    <div className="schedule-time" style={{ marginBottom: '2px' }}>{slot.hour} - {getEndTime(slot.hour)}</div>
                                    <div className="schedule-title" style={{ fontSize: '0.95rem' }}>{slot.title}</div>
                                </div>
                                <div className={`item-badge ${slot.userId ? 'badge-personal' : 'badge-public'}`} style={{ position: 'relative', top: '0', right: '0', marginLeft: '0.5rem', flexShrink: 0 }}>
                                    {slot.userId ? 'Licno' : 'Skola'}
                                </div>
                            </div>

                            {slot.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', flexGrow: 1 }}>{slot.description}</div>}

                            {!slot.description && <div style={{ flexGrow: 1 }}></div>}

                            {((isAdmin && !slot.userId) || (isUser && slot.userId)) && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => onEditClick(slot)}
                                        className="btn-secondary"
                                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                                        <Edit2 size={12} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(slot.id, !slot.userId)}
                                        className="btn-danger"
                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                        X
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {getSlotsForDay(idx).length > 0 && (isAdmin || isUser) && (
                        <button
                            onClick={() => onAddClick(idx)}
                            className="btn-secondary"
                            style={{ padding: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', borderStyle: 'dashed', opacity: 0.7 }}
                        >
                            + Dodaj čas
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}
