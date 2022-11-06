import {app} from "../../app";
import request from "supertest";
import {Ticket} from "../../models/ticket";
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

it('fetches orders of a specific user', async () => {
    const ticket1 = await buildTicket();
    const ticket2 = await buildTicket();
    const ticket3 = await buildTicket();

    const user1 = signIn();
    const user2 = signIn();

    const {body: order1} = await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ticketId: ticket1.id})
        .expect(201);
    const {body: order2} = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ticketId: ticket2.id})
        .expect(201);
    const {body: order3} = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ticketId: ticket3.id})
        .expect(201);

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', user2)
        .expect(200)

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(order2.id);
    expect(response.body[1].id).toEqual(order3.id);
})
