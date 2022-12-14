import request from "supertest";
import {app} from "../../app";

it('returns a 201 on successfull signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@dev.local",
            password: "ThisIsAPassword"
        })
        .expect(201);
});

it('returns a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "invalidInput",
            password: "ThisIsAPassword"
        })
        .expect(400);
});

it('returns a 400 with an invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@dev.local",
            password: "invalid"
        })
        .expect(400);
});

it('returns a 400 with missing email and password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@dev.local"
        })
        .expect(400);

    return request(app)
        .post('/api/users/signup')
        .send({
            password: "ThisIsAPassword"
        })
        .expect(400);
});

it('disallows duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@dev.local",
            password: "ThisIsAPassword"
        })
        .expect(201);

    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@dev.local",
            password: "ThisIsAPassword"
        })
        .expect(400);
});

it('sets a cookie after a successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@dev.local",
            password: "ThisIsAPassword"
        })
        .expect(201);

    expect(response.get('Set-Cookie'))
        .toBeDefined();

})
