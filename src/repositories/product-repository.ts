import { Product } from '@prisma/client';
import logger from '../config/logger';
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

	public async findById(id: number) {
		try {
			return await prisma.product.findUnique({ where: { id } });
		} catch (error) {
			logger.error('Error in ProductRepository.findById: ', error);
			throw error;
		}
	}
}
