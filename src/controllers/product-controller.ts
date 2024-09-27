import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/product-service';
import { successResponse } from '../middleware/success-response';
import { ValidationError } from '../errors';

export default class ProductController {
	private productService: ProductService;

	constructor() {
		this.productService = new ProductService();
	}

	public async getAllProducts(
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const products = await this.productService.getAllProducts();

			successResponse(res, { products }, 'Products fetched successfully');
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
			const id = parseInt(req.params.id, 10);
			if (isNaN(id) || id <= 0) {
				throw new ValidationError('Invalid product ID');
			}

			const product = await this.productService.getProductById(id);

			successResponse(res, { product }, 'Product fetched successfully');
		} catch (error) {
			next(error);
		}
	}
}
