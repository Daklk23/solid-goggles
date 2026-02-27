'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
}

export default function EventsList({ publicItems, personalItems, isAdmin, isUser, onDelete, onEditClick, onDayClick }: {
    publicItems: any[],
    personalItems: any[],
    isAdmin: boolean,
    isUser: boolean,
    onDelete: (id: string, isPublic: boolean) => Promise<void>,
    onEditClick: (item: any) => void,
    onDayClick?: (date: string) => void
}) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const mergedEvents = [...publicItems, ...personalItems]
        .filter(i => i.type === 'EVENT')

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const monthNames = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
    const dayNames = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']

    const days = []

    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>)
    }

    const formatDateObj = (y: number, m: number, d: number) => {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStringForInput = formatDateObj(year, month, d)

        const dayEvents = mergedEvents.filter(e => {
            const eDate = new Date(e.date)
            return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === d
        })

        days.push(
            <div
                key={d}
                className="calendar-cell"
                onClick={() => {
                    if ((isAdmin || isUser) && onDayClick) {
                        onDayClick(dateStringForInput)
                    }
                }}
                style={{ cursor: (isAdmin || isUser) ? 'pointer' : 'default' }}
            >
                <div className="calendar-day-number">{d}</div>
                <div className="calendar-events">
                    {dayEvents.map(event => (
                        <div
                            key={event.id}
                            className={`calendar-event ${event.userId ? 'personal' : 'public'}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                if ((isAdmin && !event.userId) || (isUser && event.userId)) {
                                    onEditClick(event)
                                }
                            }}
                            title={event.description ? `${event.title}\\n${event.description}` : event.title}
                        >
                            <span className="event-title-small">{event.title}</span>
                            {((isAdmin && !event.userId) || (isUser && event.userId)) && (
                                <button
                                    className="btn-danger-tiny"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete(event.id, !event.userId)
                                    }}
                                    title="Obriši"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={prevMonth} className="btn-icon"><ChevronLeft size={20} /></button>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{monthNames[month]} {year}</h2>
                <button onClick={nextMonth} className="btn-icon"><ChevronRight size={20} /></button>
            </div>

            <div className="calendar-grid">
                {dayNames.map(d => (
                    <div key={d} className="calendar-day-name">{d}</div>
                ))}
                {days}
            </div>
        </div>
    )
}
