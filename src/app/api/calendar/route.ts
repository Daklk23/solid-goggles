import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')

    try {
        let events = []
        if (uid && uid !== 'admin') {
            // Fetch public + user's personal events
            events = await prisma.item.findMany({
                where: {
                    type: 'EVENT',
                    OR: [
                        { userId: null },
                        { userId: uid }
                    ]
                }
            })
        } else {
            // Only public events
            events = await prisma.item.findMany({
                where: { type: 'EVENT', userId: null }
            })
        }

        let icsContent = "BEGIN:VCALENDAR\\nVERSION:2.0\\nPRODID:-//Skolski Raspored//SR\\n"

        events.forEach(event => {
            if (!event.date) return

            const date = new Date(event.date)
            const yyyymmdd = date.toISOString().split('T')[0].replace(/-/g, '')
            const nextDay = new Date(date)
            nextDay.setDate(nextDay.getDate() + 1)
            const nextDayStr = nextDay.toISOString().split('T')[0].replace(/-/g, '')

            const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

            icsContent += "BEGIN:VEVENT\\n"
            icsContent += `UID:${event.id}@raspored\\n`
            icsContent += `DTSTAMP:${now}\\n`
            icsContent += `DTSTART;VALUE=DATE:${yyyymmdd}\\n`
            icsContent += `DTEND;VALUE=DATE:${nextDayStr}\\n`
            icsContent += `SUMMARY:${event.title}\\n`
            if (event.description) icsContent += `DESCRIPTION:${event.description.replace(/\\n/g, '\\\\n')}\\n`

            // Podsetnik 1 dan pre
            icsContent += "BEGIN:VALARM\\n"
            icsContent += "ACTION:DISPLAY\\n"
            icsContent += "DESCRIPTION:Podsetnik za događaj\\n"
            icsContent += "TRIGGER:-P1D\\n"
            icsContent += "END:VALARM\\n"

            icsContent += "END:VEVENT\\n"
        })

        icsContent += "END:VCALENDAR"

        return new NextResponse(icsContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': 'attachment; filename="raspored.ics"',
                // Dozvoljavamo CORS tako da spoljni klijenti mogu pristupiti
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, max-age=0',
            },
        })
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
