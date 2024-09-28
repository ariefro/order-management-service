import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/product-service';
import { successResponse } from '../middleware/success-response';
import { ValidationError } from '../errors';
import { statusCreated } from '../constants/http-status-code';

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

	public async createProduct(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const name = req.body.name;
			const price = parseInt(req.body.price, 10);

			this.validateCreateProductInput(name, price);

			const product = await this.productService.createProduct(
				name,
				price,
			);

			successResponse(
				res,
				{ product },
				'Product created successfully',
				undefined,
				statusCreated,
			);
		} catch (error) {
			next(error);
		}
	}

	public async updateProduct(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const id = parseInt(req.params.id, 10);
			if (isNaN(id) || id <= 0) {
				throw new ValidationError('Invalid product ID');
			}

			const name = req.body.name;
			const price = parseInt(req.body.price, 10);

			this.validateCreateProductInput(name, price);

			const product = await this.productService.updateProduct(
				id,
				name,
				price,
			);

			successResponse(res, { product }, 'Product updated successfully');
		} catch (error) {
			next(error);
		}
	}

	public async deleteProduct(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const id = parseInt(req.params.id, 10);

			await this.productService.deleteProduct(id);

			successResponse(res, undefined, 'Product deleted successfully');
		} catch (error) {
			next(error);
		}
	}

	private validateCreateProductInput(name: string, price: number): void {
		if (!name || name.trim() === '' || !price) {
			throw new ValidationError('Please fill all of mandatory field');
		}

		if (
			typeof name !== 'string' ||
			typeof price !== 'number' ||
			price < 0
		) {
			throw new ValidationError('Invalid request parameter');
		}
	}
}
