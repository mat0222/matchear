import { uid } from './storage.js'

const PITCH_PHOTO =
  'https://images.unsplash.com/photo-1459865269847-f9fc3a4cb5fc?auto=format&fit=crop&w=800&q=80'

export function buildSeedStore() {
  const now = Date.now()

  const pitches = [
    {
      id: 'pitch_5v5',
      name: 'Cancha 5v5',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photos: [PITCH_PHOTO],
      size: '5v5',
      players: 10,
      price: 12000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    },
    {
      id: 'pitch_7v7',
      name: 'Cancha 7v7',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photos: [PITCH_PHOTO],
      size: '7v7',
      players: 14,
      price: 18000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    },
    {
      id: 'pitch_8v8',
      name: 'Cancha 8v8',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photos: [PITCH_PHOTO],
      size: '8v8',
      players: 16,
      price: 22000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    },
    {
      id: 'pitch_9v9',
      name: 'Cancha 9v9',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photos: [PITCH_PHOTO],
      size: '9v9',
      players: 18,
      price: 26000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    },
  ]

  return {
    version: 1,
    createdAt: now,
    settings: {
      slotMinutes: 60,
      depositAmount: 5000,
      depositHoldMinutes: 15,
    },
    users: [],
    pitches,
    bookings: [],
    payments: [],
    blocks: [],
    session: null,
  }
}

export function buildSeedUsers(now = Date.now()) {
  return [
    {
      id: uid('user'),
      role: 'admin',
      email: 'admin@matchear.com',
      password: 'admin123',
      name: 'Admin',
      provider: 'email',
      createdAt: now,
    },
    {
      id: uid('user'),
      role: 'user',
      email: 'user@matchear.com',
      password: 'user123',
      name: 'Usuario Demo',
      provider: 'email',
      createdAt: now,
    },
  ]
}
