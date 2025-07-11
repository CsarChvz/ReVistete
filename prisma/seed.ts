import { PrismaClient } from '@prisma/client';
import { membersData } from './membersData';
import { hash } from 'argon2'; // <--- CAMBIO AQUÍ: Importamos hash de argon2

const prisma = new PrismaClient();

async function seedMembers() {
    // Al usar .map(async ...), obtendremos un array de Promesas.
    // Necesitamos Promise.all para esperar que todas se resuelvan.
    const memberCreations = membersData.map(async member => prisma.user.create({
        data: {
            email: member.email,
            emailVerified: new Date(),
            name: member.name,
            passwordHash: await hash('password'), // <--- CAMBIO AQUÍ: Usamos hash de argon2, sin el '10'
            image: member.image,
            profileComplete: true,
            member: {
                create: {
                    dateOfBirth: new Date(member.dateOfBirth),
                    gender: member.gender,
                    name: member.name,
                    created: new Date(member.created),
                    updated: new Date(member.lastActive),
                    description: member.description,
                    city: member.city,
                    country: member.country,
                    image: member.image,
                    photos: {
                        create: {
                            url: member.image,
                            isApproved: true
                        }
                    }
                }
            }
        }
    }));
    return Promise.all(memberCreations); // Aseguramos que todas las creaciones se completen
}

async function seedAdmin() {
    return prisma.user.create({
        data: {
            email: 'admin@test.com',
            emailVerified: new Date(),
            name: 'Admin',
            passwordHash: await hash('password'), // <--- CAMBIO AQUÍ: Usamos hash de argon2, sin el '10'
            role: 'ADMIN'
        }
    })
}

async function main() {
    console.log('Starting seeding...');
    await seedMembers();
    console.log('Members seeded.');
    await seedAdmin();
    console.log('Admin user seeded.');
}

main().catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
    console.log('Seeding finished.');
})