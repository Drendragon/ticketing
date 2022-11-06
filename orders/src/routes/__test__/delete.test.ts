import {app} from "../../app";
import request from "supertest";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper";
import mongoose from "mongoose";

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    return ticket;
}
it('cancels a single order', async () => {
    const user = signIn();
    const ticket = await buildTicket();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);
})

it('can\' cancel another user\'s order', async () => {
    const user = signIn();
    const ticket = await buildTicket();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', signIn())
        .send()
        .expect(404);
})
it('emits an event on delete', async () => {
    const user = signIn();
    const ticket = await buildTicket();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
