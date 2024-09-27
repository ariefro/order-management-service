import { Router } from 'express';
import OrderController from '../controllers/order-controller';

const router = Router();
const orderController = new OrderController();

router.get('/', (req, res, next) =>
	orderController.getAllOrders(req, res, next),
);
router.post('/', (req, res, next) =>
	orderController.createOrder(req, res, next),
);
router.get('/:id', (req, res, next) =>
	orderController.getOrderDetail(req, res, next),
);
router.put('/:id', (req, res, next) =>
	orderController.editOrder(req, res, next),
);
router.delete('/:id', (req, res, next) =>
	orderController.deleteOrder(req, res, next),
);

export default router;
