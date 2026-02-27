'use client'

import { useState } from 'react'

const DAYS = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak']

export default function ScheduleView({ publicItems, personalItems, isAdmin, isUser, onDelete, onAddClick }: {
    publicItems: any[],
    personalItems: any[],
    isAdmin: boolean,
    isUser: boolean,
    onDelete: (id: string, isPublic: boolean) => Promise<void>,
    onAddClick: (dayIndex: number) => void
}) {
    const mergedSlots = [...publicItems, ...personalItems].filter(i => i.type === 'SCHEDULE_SLOT')

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
                        <div key={slot.id} className={`schedule-item ${slot.userId ? 'personal' : 'public'}`}>
                            <div className="schedule-time">{slot.hour}</div>
                            <div className="schedule-title">{slot.title}</div>
                            {slot.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{slot.description}</div>}
                            <div className={`item-badge ${slot.userId ? 'badge-personal' : 'badge-public'}`}>
                                {slot.userId ? 'Licno' : 'Skola'}
                            </div>

                            {((isAdmin && !slot.userId) || (isUser && slot.userId)) && (
                                <button
                                    onClick={() => onDelete(slot.id, !slot.userId)}
                                    className="btn-danger"
                                    style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                    X
                                </button>
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
