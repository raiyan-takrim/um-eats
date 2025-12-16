/*
 * SEED FILE CURRENTLY DISABLED
 * This seed file needs to be updated for the new schema structure:
 * 1. Remove 'password' field (Better Auth manages auth separately)
 * 2. Update organization creation to use userId instead of nested create
 * 3. Create organizations separately, then link to users
 * 
 * To enable seeding, update the schema structure or create new seed logic.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('⚠️  Seed file is currently disabled. Please update to match new schema.');
    console.log('See comments at the top of prisma/seed.ts for details.');
    return;

    /* COMMENTED OUT - NEEDS SCHEMA UPDATES
    console.log('🌱 Starting database seed...');

    // Create sample users and organizations
    const org1 = await prisma.user.upsert({
        where: { email: 'cafe@um.edu.my' },
        update: {},
        create: {
            email: 'cafe@um.edu.my',
            name: 'UM Café Central',
            role: 'ORGANIZATION',
            password: 'hashedpassword', // In production, use proper password hashing
            phone: '+60 3-7967 1234',
            organization: {
                create: {
                    name: 'UM Café Central',
                    type: 'CAFE',
                    description: 'Main campus café serving students and staff',
                    address: 'Ground Floor, Student Center',
                    phone: '+60 3-7967 1234',
                    email: 'cafe@um.edu.my',
                    latitude: 3.1216,
                    longitude: 101.6536,
                    totalFoodSaved: 245.5,
                    totalDonations: 89,
                    sdgScore: 98.5,
                    ranking: 1,
                },
            },
        },
        include: { organization: true },
    });

    const org2 = await prisma.user.upsert({
        where: { email: 'nasilemak@restaurant.my' },
        update: {},
        create: {
            email: 'nasilemak@restaurant.my',
            name: 'Restoran Nasi Kandar',
            role: 'ORGANIZATION',
            password: 'hashedpassword',
            phone: '+60 3-7967 2345',
            organization: {
                create: {
                    name: 'Restoran Nasi Kandar',
                    type: 'RESTAURANT',
                    description: 'Authentic Malaysian cuisine',
                    address: 'Near Library, Main Campus',
                    phone: '+60 3-7967 2345',
                    email: 'nasilemak@restaurant.my',
                    latitude: 3.1220,
                    longitude: 101.6538,
                    totalFoodSaved: 198.3,
                    totalDonations: 67,
                    sdgScore: 92.3,
                    ranking: 2,
                },
            },
        },
        include: { organization: true },
    });

    const org3 = await prisma.user.upsert({
        where: { email: 'klcatering@events.my' },
        update: {},
        create: {
            email: 'klcatering@events.my',
            name: 'KL Catering Services',
            role: 'ORGANIZATION',
            password: 'hashedpassword',
            phone: '+60 3-7967 3456',
            organization: {
                create: {
                    name: 'KL Catering Services',
                    type: 'CATERING',
                    description: 'Professional event catering',
                    address: 'Faculty of Engineering',
                    phone: '+60 3-7967 3456',
                    email: 'klcatering@events.my',
                    latitude: 3.1218,
                    longitude: 101.6540,
                    totalFoodSaved: 187.2,
                    totalDonations: 54,
                    sdgScore: 88.7,
                    ranking: 3,
                },
            },
        },
        include: { organization: true },
    });

    // Create sample student user
    const student = await prisma.user.upsert({
        where: { email: 'student@siswa.um.edu.my' },
        update: {},
        create: {
            email: 'student@siswa.um.edu.my',
            name: 'Ahmad Ibrahim',
            role: 'STUDENT',
            password: 'hashedpassword',
            phone: '+60 12-345 6789',
        },
    });

    console.log('✅ Created users and organizations');

    // Create sample food listings
    if (org1.organization) {
        await prisma.foodListing.create({
            data: {
                organizationId: org1.organization.id,
                title: 'Nasi Lemak Set',
                description: 'Delicious nasi lemak with sambal, egg, and anchovies. Perfect for lunch!',
                category: 'Meals',
                quantity: 15,
                unit: 'portions',
                status: 'AVAILABLE',
                availableFrom: new Date(),
                availableUntil: new Date(Date.now() + 3 * 60 * 60 * 1000),
                pickupLocation: 'UM Café Central, Ground Floor',
                latitude: 3.1216,
                longitude: 101.6536,
                isVegetarian: false,
                isVegan: false,
                isHalal: true,
                allergens: ['peanuts', 'fish', 'eggs'],
                tags: ['spicy', 'local', 'malaysian'],
            },
        });

        await prisma.foodListing.create({
            data: {
                organizationId: org1.organization.id,
                title: 'Fresh Sandwiches',
                description: 'Assorted sandwiches - chicken and vegetarian options',
                category: 'Meals',
                quantity: 12,
                unit: 'pieces',
                status: 'AVAILABLE',
                availableFrom: new Date(),
                availableUntil: new Date(Date.now() + 2 * 60 * 60 * 1000),
                pickupLocation: 'UM Café Central, Ground Floor',
                latitude: 3.1216,
                longitude: 101.6536,
                isVegetarian: false,
                isVegan: false,
                isHalal: true,
                allergens: ['gluten', 'dairy'],
                tags: ['healthy'],
            },
        });
    }

    if (org2.organization) {
        await prisma.foodListing.create({
            data: {
                organizationId: org2.organization.id,
                title: 'Vegetable Curry with Rice',
                description: 'Healthy mixed vegetable curry with rice. Vegan and nutritious!',
                category: 'Meals',
                quantity: 10,
                unit: 'portions',
                status: 'AVAILABLE',
                availableFrom: new Date(),
                availableUntil: new Date(Date.now() + 4 * 60 * 60 * 1000),
                pickupLocation: 'Restoran Nasi Kandar, Near Library',
                latitude: 3.1220,
                longitude: 101.6538,
                isVegetarian: true,
                isVegan: true,
                isHalal: true,
                allergens: [],
                tags: ['healthy', 'spicy', 'vegan'],
            },
        });
    }

    if (org3.organization) {
        await prisma.foodListing.create({
            data: {
                organizationId: org3.organization.id,
                title: 'Event Leftover Snacks',
                description: 'Assorted snacks and pastries from morning seminar',
                category: 'Snacks',
                quantity: 25,
                unit: 'pieces',
                status: 'AVAILABLE',
                availableFrom: new Date(),
                availableUntil: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
                pickupLocation: 'Faculty of Engineering, Lobby',
                latitude: 3.1218,
                longitude: 101.6540,
                isVegetarian: true,
                isVegan: false,
                isHalal: true,
                allergens: ['gluten', 'dairy', 'nuts'],
                tags: ['sweet', 'event'],
            },
        });
    }

    console.log('✅ Created food listings');
    console.log('🎉 Database seed completed successfully!');
    END OF COMMENTED CODE */
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
