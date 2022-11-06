import express, {Request, Response} from "express";
import mongoose from "mongoose";
import {body} from "express-validator";
import {BadRequestException, NotFoundError, OrderStatus, requireAuth, validateRequest} from "@drendragonprojekt/common";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";
import {Order} from "../models/order";
import {Ticket} from "../models/ticket";

const router = express.Router();
const EXPIRATION_WINDOW_SECOND = 1 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => {
            return mongoose.Types.ObjectId.isValid(input)
        })
        .withMessage('TicketId is not provided'),
], validateRequest, async (req: Request, res: Response) => {
    const {ticketId} = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    if (await ticket.isReserved()) {
        throw new BadRequestException("The ticket is already reserved!");
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECOND);

    const order = Order.build({
        userId: req.currentUser!.id,
        ticket,
        status: OrderStatus.Created,
        expiresAt
    });

    await order.save();
    // TODO database transaction
    await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        userId: order.userId,
        status: order.status,
        expiresAt: order.expiresAt.toISOString(),
        version: order.version,
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    });

    res.status(201).send(order);
})

export {router as createOrderRouter}
