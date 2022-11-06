import {TicketUpdatedEvent} from "@drendragonprojekt/common";
import {Message} from "node-nats-streaming";
import mongoose from "mongoose";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import {TicketUpdatedListener} from "../ticket-updated-listener";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 10
    });
    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        title: "test 2",
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: ticket.version +1
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg, ticket}
};

it('updates and saves a ticket', async () => {
    const {listener, data, msg, ticket} = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('ack the message', async () => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack() if the event has a skipped version number', async () => {
    const {listener, data, msg, ticket} = await setup();
    data.version = 10;

    try{
        await listener.onMessage(data, msg);
    }catch ($e){

    }

    expect(msg.ack).not.toHaveBeenCalled();

})
