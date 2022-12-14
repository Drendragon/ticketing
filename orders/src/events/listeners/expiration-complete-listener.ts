import {Message} from "node-nats-streaming";
import {Subjects, Listener, ExpirationCompleteEvent, NotFoundError, OrderStatus} from "@drendragonprojekt/common";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    queueGroupName: string = queueGroupName;
    readonly subject = Subjects.ExpirationComplete;

    async onMessage(data: ExpirationCompleteEvent["data"], msg: Message): Promise<void> {
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError();
        }

        if (order.status === OrderStatus.Complete) {
            msg.ack();
            return;
        }

        order.set({
            status: OrderStatus.Cancelled
        });
        await order.save()

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        msg.ack();
    }

}
