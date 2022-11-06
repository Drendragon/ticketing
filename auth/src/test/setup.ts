import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {app} from "../app";
import request from "supertest";

declare global {
    var signIn: () => Promise<string[]>;
}

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'áofgbhnáofgháof';
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({})
    }
});

afterAll(async () => {
    if (mongo) {
        mongo.stop();
    }
    await mongoose.connection.close();
});

global.signIn = async () => {
    const email = "test@dev.local";
    const password = "ThisIsAPassword";

    const response = await request(app)
        .post('/api/users/signup')
        .send({email, password})
        .expect(201);

    const cookie = response.get('Set-Cookie');

    return cookie;
}

jest.setTimeout(50000);
