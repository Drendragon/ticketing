import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@drendragonprojekt/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";

jest.mock('../../stripe');

describe('new payment tests', function () {
    it('returns a 404 if the order does not exists', async () => {
        const res = await request(app)
            .post('/api/payments')
            .set('Cookie', signIn())
            .send({
                token: "asda",
                orderId: new mongoose.Types.ObjectId().toHexString()
            });

        expect(res.status).toEqual(400);
    });
    it('returns a 400 if the order does not belong to the user', async () => {
        const order = Order.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            userId: new mongoose.Types.ObjectId().toHexString(),
            version: 0,
            price: 20,
            status: OrderStatus.Created
        });
        await order.save();

        const res = await request(app)
            .post('/api/payments')
            .set('Cookie', signIn())
            .send({
                token: "asda",
                orderId: order.id
            });
        expect(res.status).toEqual(400);
    });
    it('returns a 400 if the order is cancelled', async () => {
        const order = Order.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            userId: new mongoose.Types.ObjectId().toHexString(),
            version: 0,
            price: 20,
            status: OrderStatus.Cancelled
        });
        await order.save();

        const res = await request(app)
            .post('/api/payments')
            .set('Cookie', signIn(order.userId))
            .send({
                token: "asda",
                orderId: order.id
            });
        expect(res.status).toEqual(400);
    });
    it('returns a 201 with valid inputs', async () => {
        const order = Order.build({
            id: new mongoose.Types.ObjectId().toHexString(),
            userId: new mongoose.Types.ObjectId().toHexString(),
            version: 0,
            price: 20,
            status: OrderStatus.Created
        });
        await order.save();

        const res = await request(app)
            .post('/api/payments')
            .set('Cookie', signIn(order.userId))
            .send({
                token: "tok_visa",
                orderId: order.id
            });

        expect(res.status).toEqual(201);

        const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
        expect(chargeOptions.source).toEqual('tok_visa');
        expect(chargeOptions.amount).toEqual(order.price * 100);

        const payment = await Payment.findOne({
            orderId: order.id
        });
        expect(payment).toBeDefined();
    });
});
