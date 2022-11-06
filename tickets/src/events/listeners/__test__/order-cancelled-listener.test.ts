import {OrderCancelledEvent, OrderStatus} from "@drendragonprojekt/common";
import {OrderCancelledListener} from "../order-cancelled-listener";
import {Message} from "node-nats-streaming";
import mongoose from "mongoose";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'Teszt',
        price: 99,
        userId: "asd",
    });
    ticket.set({orderId})
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg, ticket, orderId}
};

it('updates the ticket', async () => {
    const {listener, data, msg, ticket} = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(undefined);

});

it('ack the message', async () => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

it('publishes a ticket:updated event', async () => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(ticketUpdatedData.orderId).toEqual(undefined);
})

