import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL não definida no ambiente')

// Módulos ESM são avaliados uma única vez: esta instância é o singleton da aplicação.
export const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
