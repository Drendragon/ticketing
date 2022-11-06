import {Listener, NotFoundError, OrderCancelledEvent, OrderStatus, Subjects} from "@drendragonprojekt/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    queueGroupName: string = queueGroupName;
    readonly subject = Subjects.OrderCancelled;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message): Promise<void> {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });

        if (!order) {
            throw new NotFoundError();
        }

        order.set({
            status: OrderStatus.Cancelled
        });
        await order.save();

        msg.ack();
    }

}
