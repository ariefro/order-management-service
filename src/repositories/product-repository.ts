import { Product } from '@prisma/client';
import logger from '../configs/logger';
import prisma from '../../prisma/client';

export class ProductRepository {
	public async findAll(): Promise<Product[]> {
		try {
			return await prisma.product.findMany();
		} catch (error) {
			logger.error('Error in ProductRepository.findAll: ', error);
			throw error;
		}
	}

	public async findById(id: number): Promise<Product | null> {
		try {
			return await prisma.product.findUnique({ where: { id } });
		} catch (error) {
			logger.error('Error in ProductRepository.findById: ', error);
			throw error;
		}
	}

	public async createOne(name: string, price: number): Promise<Product> {
		try {
			return await prisma.product.create({ data: { name, price } });
		} catch (error) {
			logger.error('Error in ProductRepository.createOne: ', error);
			throw error;
		}
	}

	public async updateOne(
		id: number,
		name: string,
		price: number,
	): Promise<Product> {
		try {
			return await prisma.product.update({
				where: { id },
				data: { name, price },
			});
		} catch (error) {
			logger.error('Error in ProductRepository.updateOne: ', error);
			throw error;
		}
	}

	public async deleteOne(id: number) {
		try {
			return await prisma.product.delete({
				where: { id },
			});
		} catch (error) {
			logger.error('Error in ProductRepository.deleteOne: ', error);
			throw error;
		}
	}
}
