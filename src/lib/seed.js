import { uid } from './storage.js'

export function buildSeedStore() {
  const now = Date.now()

  const pitches = [
    {
      id: uid('pitch'),
      name: 'Cancha 5v5',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photos: ['/hero.jpg'],
      size: '5v5',
      players: 10,
      price: 12000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    },
    {
      id: uid('pitch'),
      name: 'Cancha 7v7',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photos: ['/hero.jpg'],
      size: '7v7',
      players: 14,
      price: 18000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    },
    {
      id: uid('pitch'),
      name: 'Cancha 8v8',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photos: ['/hero.jpg'],
      size: '8v8',
      players: 16,
      price: 22000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    },
    {
      id: uid('pitch'),
      name: 'Cancha 9v9',
      sport: 'futbol',
      surface: 'sintetico',
      roof: 'descubierta',
      photos: ['/hero.jpg'],
      size: '9v9',
      players: 18,
      price: 26000,
      description: 'Césped sintético de alta calidad, iluminación LED',
    },
  ]

  const users = [
    {
      id: uid('user'),
      role: 'admin',
      email: 'admin@matchear.com',
      password: 'admin123',
      name: 'Admin',
      createdAt: now,
    },
    {
      id: uid('user'),
      role: 'user',
      email: 'user@matchear.com',
      password: 'user123',
      name: 'Usuario',
      createdAt: now,
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
    users,
    pitches,
    bookings: [],
    payments: [],
    blocks: [],
    session: null,
  }
}


