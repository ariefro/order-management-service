import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/product-service';
import { successResponse } from '../middleware/success-response';
import { NotFoundError, ValidationError } from '../errors';

export default class ProductController {
	private productService: ProductService;

	constructor() {
		this.productService = new ProductService();
	}

	public async getAllProducts(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const page = parseInt(req.query.page as string, 10) || 1;
			const limit = parseInt(req.query.limit as string, 10) || 10;

			const offset = (page - 1) * limit;
			const { products, totalItems } =
				await this.productService.getAllProducts({ limit, offset });

			const totalPages = Math.ceil(totalItems / limit);

			successResponse(
				res,
				{ products },
				'Products fetched successfully',
				{ totalItems, totalPages, currentPage: page, pageSize: limit },
			);
		} catch (error) {
			next(error);
		}
	}

	public async getProductById(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const id = parseInt(req.params.id as string, 10);
			if (isNaN(id) || id <= 0) {
				throw new ValidationError('Invalid product ID');
			}

			const product = await this.productService.getProductById(id);
			if (!product) {
				throw new NotFoundError('Product not found');
			}

			successResponse(res, { product }, 'Product fetched successfully');
		} catch (error) {
			next(error);
		}
	}
}
