import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialProducts = [
	{
		name: 'Noodle Nova',
		price: 20000,
	},
	{
		name: 'QuickBite Bliss',
		price: 17000,
	},
	{
		name: 'Flavor Flash',
		price: 12000,
	},
	{
		name: 'Swift Eats',
		price: 18000,
	},
	{
		name: 'Snap Snacks',
		price: 10000,
	},
	{
		name: 'BiteBurst Bites',
		price: 22000,
	},
	{
		name: 'Taste Twirl',
		price: 15000,
	},
	{
		name: 'Speedy Munch',
		price: 13000,
	},
	{
		name: 'Crunchy Delight',
		price: 19000,
	},
	{
		name: 'Snacky Surge',
		price: 16000,
	},
];

const seed = async () => {
	await prisma.product.deleteMany();

	await prisma.product.createMany({ data: initialProducts });
};

seed();
