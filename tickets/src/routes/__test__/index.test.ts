import request from "supertest";
import {app} from "../../app";

const createTicket = () =>{
    const title = "Teszt";
    const price = 20;

    return request(app)
        .post("/api/tickets")
        .set('Cookie', signIn())
        .send({title, price})
        .expect(201);
}

it('can fatch a list of tickets', async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const res = await request(app)
        .get("/api/tickets")
        .send()
        .expect(200);

    expect(res.body.length).toEqual(3);

})
