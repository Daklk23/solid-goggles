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
