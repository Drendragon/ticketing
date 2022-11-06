import {OrderCancelledEvent, OrderStatus} from "@drendragonprojekt/common";
import {OrderCancelledListener} from "../order-cancelled-listener";
import {Message} from "node-nats-streaming";
import mongoose from "mongoose";
import {natsWrapper} from "../../../nats-wrapper";
import {Order} from "../../../models/order";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 10,
        userId: "not in use",
        version: 0
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: "not in use"
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg, order}
};

describe("order:cancelled event listener teszt", () => {
    it('updates the order to status: cancelled', async () => {
        const {listener, data, msg, order} = await setup();
        await listener.onMessage(data, msg);

        const updatedOrder =  await Order.findById(order.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
    });

    it('ack the message', async () => {
        const {listener, data, msg} = await setup();
        await listener.onMessage(data, msg);
        expect(msg.ack).toHaveBeenCalled();
    })

})

