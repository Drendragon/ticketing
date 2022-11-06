import express, {Request, Response} from "express";
import {body} from "express-validator";
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    NotAuthorizedException, BadRequestException
} from "@drendragonprojekt/common";
import {Ticket} from "../models/ticket";
import {natsWrapper} from "../nats-wrapper";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";

const router = express.Router();

router.put('/api/tickets/:id', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is not provided'),
    body('price')
        .isFloat({gt: 0})
        .withMessage('Price must be grater than 0')
], validateRequest, async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new NotFoundError();
    }

    if(ticket.orderId){
        throw new BadRequestException("Ticket is reserved, update is prohibited");
    }

    if (ticket.userId !== req.currentUser!.id) {
        // TODO create Forbidden error type
        throw new NotAuthorizedException()
    }

    ticket.set({
        title: req.body.title,
        price: req.body.price
    })

    await ticket.save();
    // TODO database transaction
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    });

    res.send(ticket);

});


export {router as editTicketRouter}
