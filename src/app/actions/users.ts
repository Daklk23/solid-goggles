'use server'

import prisma from '@/lib/db'
import { getSession } from './auth'

export async function getUsers() {
    const session = await getSession()
    if (session?.role !== 'admin') throw new Error('Unauthorized')
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function createUser(username: string, pin: string) {
    const session = await getSession()
    if (session?.role !== 'admin') throw new Error('Unauthorized')
    return prisma.user.create({ data: { username, pin } })
}

export async function deleteUser(id: string) {
    const session = await getSession()
    if (session?.role !== 'admin') throw new Error('Unauthorized')
    return prisma.user.delete({ where: { id } })
}
