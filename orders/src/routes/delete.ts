import express, {Request, Response} from "express";
import {Order} from "../models/order";
import {NotFoundError, OrderStatus, requireAuth} from "@drendragonprojekt/common";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findOne({
        userId: req.currentUser!.id,
        id: req.params.orderId
    }).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    order.set({
        status: OrderStatus.Cancelled
    })

    await order.save();
    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket:{
            id: order.ticket.id
        }
    })

    res.status(204).send(order);
});

export {router as deleteOrdersRouter}
