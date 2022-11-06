import {Message} from "node-nats-streaming";
import {Subjects, Listener, PaymentCreatedEvent, NotFoundError} from "@drendragonprojekt/common";
import {queueGroupName} from "./queue-group-name";
import {Order, OrderStatus} from "../../models/order";


export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: PaymentCreatedEvent["data"], msg: Message): Promise<void> {
        const {id, orderId} = data;

        const order = await Order.findById(orderId);

        if(!order){
            throw new NotFoundError();
        }

        order.set({
            status: OrderStatus.Complete
        })
        await order.save();

        // TODO OrderUpdated Event

        msg.ack();
    }

}
