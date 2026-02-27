'use server'

import { cookies } from 'next/headers'
import prisma from '@/lib/db'

// Helper to sign/verify tokens (simplified since it's just for school usage + SQLite)
const SECRET = process.env.SECRET || 'super-secret-key-change-me'

export async function login(username: string, pin: string) {
    // Check if admin
    if (username === process.env.ADMIN_USERNAME && pin === process.env.ADMIN_PIN) {
        const sessionCookie = await cookies()
        sessionCookie.set('session', JSON.stringify({ role: 'admin' }), { httpOnly: true, secure: true })
        return { success: true, role: 'admin' }
    }

    // Check if standard user
    const user = await prisma.user.findUnique({ where: { username } })
    if (user && user.pin === pin) {
        const sessionCookie = await cookies()
        sessionCookie.set('session', JSON.stringify({ role: 'user', userId: user.id }), { httpOnly: true, secure: true })
        return { success: true, role: 'user' }
    }

    return { success: false, error: 'Pogrešan username ili PIN' }
}

export async function logout() {
    const sessionCookie = await cookies()
    sessionCookie.delete('session')
}

export async function getSession() {
    const sessionCookie = await cookies()
    const session = sessionCookie.get('session')?.value
    if (!session) return null
    try {
        return JSON.parse(session)
    } catch (e) {
        return null
    }
}
