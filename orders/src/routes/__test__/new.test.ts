import {app} from "../../app";
import request from "supertest";
import mongoose from "mongoose";
import {Ticket} from "../../models/ticket";
import {Order} from "../../models/order";
import {OrderStatus} from "@drendragonprojekt/common";
import {natsWrapper} from "../../nats-wrapper";

it('has a route handler listening to /api/orders for POST requests', async () => {
    const response = await request(app)
        .post("/api/orders")
        .send({});

    expect(response.status).not.toEqual(404)
})
it('can only bae accessed if the user is signed in', async () => {
    await request(app)
        .post("/api/orders")
        .send({})
        .expect(401)
})
it('returns a status other than 401 if the user is signed in', async () => {
    const response = await request(app)
        .post("/api/orders")
        .set('Cookie', signIn())
        .send({})

    expect(response.status).not.toEqual(401)
})
it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post("/api/orders")
        .set('Cookie', signIn())
        .send()
        .expect(400)
    await request(app)
        .post("/api/orders")
        .set('Cookie', signIn())
        .send({
            ticketId: '123'
        })
        .expect(400)
})
it('returns an error if the ticket does not exists', async () => {
    await request(app)
        .post("/api/orders")
        .set('Cookie', signIn())
        .send({
            ticketId: new mongoose.Types.ObjectId()
        })
        .expect(404)
})
it('returns an error if the ticket is already reserves', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const order= Order.build({
        ticket,
        userId: "pfkgbjpfijg",
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();

    await request(app)
        .post("/api/orders")
        .set('Cookie', signIn())
        .send({
            ticketId: ticket.id
        })
        .expect(400 )
});
it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set('Cookie', signIn())
        .send({
            ticketId: ticket.id
        })
        .expect(201 )
})
it('publishes an event on create', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set('Cookie', signIn())
        .send({
            ticketId: ticket.id
        })
        .expect(201 )
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
