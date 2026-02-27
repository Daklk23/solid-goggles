'use client'

import { useState, useEffect } from 'react'

export default function AddItemModal({ isOpen, onClose, onAdd, initialType = 'SCHEDULE_SLOT', initialDay = '1' }: { isOpen: boolean, onClose: () => void, onAdd: (data: any) => Promise<void>, initialType?: string, initialDay?: string }) {
    const [type, setType] = useState(initialType)
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const [day, setDay] = useState(initialDay)
    const [time, setTime] = useState('08:00')
    const [date, setDate] = useState('')

    useEffect(() => {
        if (isOpen) {
            setType(initialType)
            setDay(initialDay)
            setTitle('')
            setDesc('')
            setTime('08:00')
            setDate('')
        }
    }, [isOpen, initialType, initialDay])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onAdd({
            type,
            title,
            description: desc,
            ...(type === 'SCHEDULE_SLOT' ? { dayOfWeek: parseInt(day), hour: time } : { date: new Date(date).toISOString() })
        })
        setTitle(''); setDesc(''); setDay('1'); setTime('08:00'); setDate('');
        onClose()
    }

    return (
        <div className="modal-backdrop">
            <div className="glass-panel modal">
                <h2 className="section-title" style={{ marginTop: 0 }}>Dodaj novu stavku</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tip stavke</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="SCHEDULE_SLOT">Čas za raspored</option>
                            <option value="EVENT">Provera / Događaj</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Naslov</label>
                        <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Npr. Matematika" />
                    </div>

                    <div className="form-group">
                        <label>Opis (opciono)</label>
                        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Detalji..." />
                    </div>

                    {type === 'SCHEDULE_SLOT' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Dan</label>
                                <select value={day} onChange={(e) => setDay(e.target.value)}>
                                    <option value="1">Ponedeljak</option>
                                    <option value="2">Utorak</option>
                                    <option value="3">Sreda</option>
                                    <option value="4">Četvrtak</option>
                                    <option value="5">Petak</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Vreme</label>
                                <input
                                    required
                                    type="text"
                                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                                    title="Unesite vreme u formatu HH:MM (npr. 08:00 ili 14:30)"
                                    placeholder="Npr. 14:30"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Datum događaja</label>
                            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Otkaži</button>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Dodaj</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
