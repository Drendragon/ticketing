import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper";

it('has a route handler listening to /api/tickets for POST requests', async () => {
    const response = await request(app)
        .post("/api/tickets")
        .send({});

    expect(response.status).not.toEqual(404)
})
it('can only bae accessed if the user is signed in', async () => {
    await request(app)
        .post("/api/tickets")
        .send({})
        .expect(401)
})
it('returns a status other than 401 if the user is signed in', async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set('Cookie', signIn())
        .send({})

    expect(response.status).not.toEqual(401)
})
it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post("/api/tickets")
        .set('Cookie', signIn())
        .send({
            title: '',
            price: 10
        })
        .expect(400)

    await request(app)
        .post("/api/tickets")
        .set('Cookie', signIn())
        .send({
            price: 10
        })
        .expect(400)
})
it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post("/api/tickets")
        .set('Cookie', signIn())
        .send({
            title: 'Title',
            price: -10
        })
        .expect(400)

    await request(app)
        .post("/api/tickets")
        .set('Cookie', signIn())
        .send({
            title: "Title"
        })
        .expect(400)
})
it('creates a ticket with valid inputs', async () => {
    // add in a check to make sure the ticket is saved
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0)

    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', signIn())
        .send({
            title: "Teszt",
            price: 20
        });

    expect(res.status).toEqual(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);

    expect(tickets[0].title).toEqual("Teszt")
    expect(tickets[0].price).toEqual(20)
})
it('should publis an event', async () => {
   const res = await request(app)
        .post('/api/tickets')
        .set('Cookie', signIn())
        .send({
            title: "Teszt",
            price: 20
        });

    expect(res.status).toEqual(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
