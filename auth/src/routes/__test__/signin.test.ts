import request from "supertest";
import {app} from "../../app";

it('fails when an e-mail that does not exist is supplied', async () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: "test@dev.local",
            password: "ThisIsAPassword"
        })
        .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@dev.local",
            password: "ThisIsAPassword"
        })
        .expect(201);

    return request(app)
        .post('/api/users/signin')
        .send({
            email: "test@dev.local",
            password: "ThisIsAPassword_invalid"
        })
        .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@dev.local",
            password: "ThisIsAPassword"
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@dev.local",
            password: "ThisIsAPassword"
        })
        .expect(201);

    expect(response.get('Set-Cookie'))
        .toBeDefined();
});
