'use server'

import prisma from '@/lib/db'
import { getSession } from './auth'

export async function getPublicItems() {
    return prisma.item.findMany({
        where: { userId: null },
        orderBy: { createdAt: 'asc' }
    })
}

export async function getPersonalItems() {
    const session = await getSession()
    if (!session || session.role !== 'user') return []
    return prisma.item.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'asc' }
    })
}

export async function createPublicItem(data: any) {
    const session = await getSession()
    if (session?.role !== 'admin') throw new Error('Unauthorized')
    return prisma.item.create({
        data: {
            ...data,
            userId: null
        }
    })
}

export async function deletePublicItem(id: string) {
    const session = await getSession()
    if (session?.role !== 'admin') throw new Error('Unauthorized')
    return prisma.item.delete({ where: { id } })
}

export async function createPersonalItem(data: any) {
    const session = await getSession()
    if (session?.role !== 'user') throw new Error('Unauthorized')
    return prisma.item.create({
        data: {
            ...data,
            userId: session.userId
        }
    })
}

export async function deletePersonalItem(id: string) {
    const session = await getSession()
    if (session?.role !== 'user') throw new Error('Unauthorized')
    return prisma.item.delete({ where: { id, userId: session.userId } })
}

async function syncSubsequentSlots(dayOfWeek: number | null, userId: string | null, startId: string, startHour: string | null) {
    if (dayOfWeek === null || !startHour) return;

    // Get all slots for this day/user, sorted by current time
    const slots = await prisma.item.findMany({
        where: {
            type: 'SCHEDULE_SLOT',
            dayOfWeek,
            userId
        },
        orderBy: { hour: 'asc' }
    });

    const startIndex = slots.findIndex(s => s.id === startId);
    if (startIndex === -1) return;

    let currentStartTime = startHour;
    const updates = [];

    // We start from the NEXT one because the current one is already updated
    for (let i = startIndex + 1; i < slots.length; i++) {
        // Calculate next start time (prev + 50 mins)
        const parts = currentStartTime.split(':');
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);

        let nextM = m + 50; // 45 min class + 5 min break
        let nextH = h + Math.floor(nextM / 60);
        nextM %= 60;
        const nextTime = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;

        updates.push(prisma.item.update({
            where: { id: slots[i].id },
            data: { hour: nextTime }
        }));

        currentStartTime = nextTime;
    }

    if (updates.length > 0) {
        await prisma.$transaction(updates);
    }
}

export async function updatePublicItem(id: string, data: any) {
    const session = await getSession()
    if (session?.role !== 'admin') throw new Error('Unauthorized')

    const updated = await prisma.item.update({
        where: { id },
        data: {
            ...data,
            userId: null
        }
    })

    if (updated.type === 'SCHEDULE_SLOT') {
        await syncSubsequentSlots(updated.dayOfWeek, null, updated.id, updated.hour)
    }

    return updated
}

export async function updatePersonalItem(id: string, data: any) {
    const session = await getSession()
    if (session?.role !== 'user') throw new Error('Unauthorized')

    const updated = await prisma.item.update({
        where: { id, userId: session.userId },
        data: {
            ...data,
            userId: session.userId
        }
    })

    if (updated.type === 'SCHEDULE_SLOT') {
        await syncSubsequentSlots(updated.dayOfWeek, session.userId, updated.id, updated.hour)
    }

    return updated
}

export async function deleteAllPublicItems() {
    const session = await getSession()
    if (session?.role !== 'admin') throw new Error('Unauthorized')
    return prisma.item.deleteMany({
        where: { userId: null, type: 'SCHEDULE_SLOT' }
    })
}

export async function deleteAllPersonalItems() {
    const session = await getSession()
    if (session?.role !== 'user') throw new Error('Unauthorized')
    return prisma.item.deleteMany({
        where: { userId: session.userId, type: 'SCHEDULE_SLOT' }
    })
}
