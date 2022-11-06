import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";
import * as Mongoose from "mongoose";

it('returns a 404 if the id does not exists', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', signIn())
        .send({
            title: "Update",
            price: 20
        })
        .expect(404)
})
it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: "Update",
            price: 20
        }).expect(401)
})
it('returns a 403 if the user does not own the ticket', async () => {
    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', signIn())
        .send({
            title: "Teszt",
            price: 20
        });

    const id = res.body.id;
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', signIn())
        .send({
            title: "Update",
            price: 20
        }).expect(401)
})
it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = signIn();

    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Teszt",
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "",
            price: 20
        }).expect(400);
    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            price: 20
        }).expect(400);
    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "Update",
            price: 0
        }).expect(400);
    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "Update",
        }).expect(400);
})
it('updates the ticket provided valid inputs', async () => {
    const cookie = signIn();

    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Teszt",
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "Update",
            price: 10
        }).expect(200);

    const editedTicket = await request(app)
        .get(`/api/tickets/${res.body.id}`)
        .send();

    expect(editedTicket.body.title).toEqual("Update");
    expect(editedTicket.body.price).toEqual(10);
})
it('should publish an event on update', async () => {
    const cookie = signIn();

    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Teszt",
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "Update",
            price: 10
        }).expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
it('rejects the update, if the ticket is reserved', async () => {
    const cookie = signIn();
    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Teszt",
            price: 20
        });

    const ticket = await Ticket.findById(res.body.id);
    ticket!.set({
        orderId: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: "Update",
            price: 10
        }).expect(400);
})
