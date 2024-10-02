import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { OrderController } from '../controllers';
import {
	CustomerRepository,
	OrderItemRepository,
	OrderRepository,
	ProductRepository,
} from '../repositories';
import { OrderService } from '../services';

const router = Router();

const prisma = new PrismaClient();
const orderRepository = new OrderRepository(prisma);
const orderItemRepository = new OrderItemRepository();
const customerRepository = new CustomerRepository();
const productRepository = new ProductRepository(prisma);

const orderService = new OrderService(
	prisma,
	orderRepository,
	orderItemRepository,
	customerRepository,
	productRepository,
);

const orderController = new OrderController(orderService);

router.get('/', (req, res, next) => orderController.getOrders(req, res, next));
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
