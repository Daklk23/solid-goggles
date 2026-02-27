'use client'

export default function EventsList({ publicItems, personalItems, isAdmin, isUser, onDelete }: {
    publicItems: any[],
    personalItems: any[],
    isAdmin: boolean,
    isUser: boolean,
    onDelete: (id: string, isPublic: boolean) => Promise<void>
}) {
    const mergedEvents = [...publicItems, ...personalItems]
        .filter(i => i.type === 'EVENT')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const formatMonth = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sr', { month: 'short' })
    }

    const formatDay = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sr', { day: '2-digit' })
    }

    return (
        <div className="events-list">
            {mergedEvents.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                    Nema najavljenih događaja ili provera.
                </div>
            ) : mergedEvents.map(event => (
                <div key={event.id} className={`event-card ${event.userId ? 'personal' : 'public'}`}>
                    <div className="event-date">
                        <span className="event-month">{formatMonth(event.date)}</span>
                        {formatDay(event.date)}
                    </div>

                    <div className="event-details">
                        <div className="event-title">
                            {event.title}
                            <span className={`item-badge ${event.userId ? 'badge-personal' : 'badge-public'}`} style={{ position: 'relative', top: 'auto', right: 'auto' }}>
                                {event.userId ? 'Licno' : 'Skola'}
                            </span>
                        </div>
                        {event.description && <div className="event-desc">{event.description}</div>}
                    </div>

                    {((isAdmin && !event.userId) || (isUser && event.userId)) && (
                        <button
                            onClick={() => onDelete(event.id, !event.userId)}
                            className="btn-danger">
                            Obriši
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}
