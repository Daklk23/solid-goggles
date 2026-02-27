'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSession } from './auth'
import { createPublicItem } from './items'

export async function scanAndImportSchedule(base64Image: string, mimeType: string) {
    const session = await getSession()
    if (session?.role !== 'admin') throw new Error('Unauthorized')

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY nije definisan u .env fajlu. Molimo vas dodajte ga.')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // Koristimo gemini-2.5-flash jer vidimo da je dostupan na vašem nalogu
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Ti si AI asistent koji čita školski raspored časova sa slike.
Izvuci sve navedene predmete i njihov raspored.
Vrati isključivo validan JSON niz objekata, BEZ ikakvog dodatnog teksta, BEZ markdown blokova (na primer: ne koristi \`\`\`json).
Svaki objekat u nizu predstavlja jedan čas i OBAVEZNO mora da ima sledeća polja:
- "title": (string) Naziv predmeta (npr. "Matematika")
- "dayOfWeek": (number) Dan u nedelji kao broj (1=Ponedeljak, 2=Utorak, 3=Sreda, 4=Četvrtak, 5=Petak)
- "hour": (string) Vreme prepoznato sa slike (početak časa) u formatu "HH:MM" (npr. "08:00"). Ako vreme nije navedeno na slici, pretpostavi ga. Neka prvi čas počinje u 08:00, a svaki sledeći čas neka se pomera za po 50 minuta unapred (45 čas + 5 odmor).
- "description": (string, opciono) Bilo kakve dodatne informacije poput broja kabineta, učionice, imena profesora i slično. Zadrži format stringa, i stavi prazan string "\`\" ako nema.

Primer validnog izlaza:
[{"title": "Matematika", "dayOfWeek": 1, "hour": "08:00", "description": "Kabinet 4"}, {"title": "Fizika", "dayOfWeek": 1, "hour": "08:50", "description": ""}]`

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]);

        let text = result.response.text();
        text = text.trim();
        // Očisti backtick-ove ako ih model ipak vrati
        if (text.startsWith('```json')) {
            text = text.substring(7);
        }
        if (text.startsWith('```')) {
            text = text.substring(3);
        }
        if (text.endsWith('```')) {
            text = text.substring(0, text.length - 3);
        }
        text = text.trim();

        const scheduleItems = JSON.parse(text);

        let count = 0;
        for (const item of scheduleItems) {
            await createPublicItem({
                type: 'SCHEDULE_SLOT',
                title: item.title,
                dayOfWeek: item.dayOfWeek,
                hour: item.hour,
                description: item.description || ''
            });
            count++;
        }

        return { success: true, count }
    } catch (error: any) {
        console.error('Gemini error:', error);

        let availableModels = '';
        try {
            // Ako je greška do modela, da izvučemo šta je na raspolaganju
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await response.json();
            if (data.models) {
                availableModels = ' Dostupni modeli na vašem ključu su: ' + data.models.map((m: any) => m.name.replace('models/', '')).filter((n: string) => n.includes('gemini')).join(', ');
            }
        } catch (e) {
            // ignored
        }

        throw new Error('Greška pri AI obradi slike (proverite API ključ i sliku): ' + error.message + availableModels)
    }
}
