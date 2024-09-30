import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProductController } from '../controllers';
import { ProductService } from '../services';
import { ProductRepository } from '../repositories';

const router = Router();

const prisma = new PrismaClient();
const productRepository = new ProductRepository(prisma);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get('/', (req, res, next) =>
	productController.getAllProducts(req, res, next),
);
router.post('/', (req, res, next) =>
	productController.createProduct(req, res, next),
);
router.get('/:id', (req, res, next) =>
	productController.getProductById(req, res, next),
);
router.put('/:id', (req, res, next) =>
	productController.updateProduct(req, res, next),
);
router.delete('/:id', (req, res, next) =>
	productController.deleteProduct(req, res, next),
);

export default router;
