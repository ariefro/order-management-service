import { Router } from 'express';
import ProductController from '../controllers/product-controller';

const router = Router();
const productController = new ProductController();

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
