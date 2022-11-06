import {Message} from "node-nats-streaming";
import {Subjects, Listener, TicketUpdatedEvent} from "@drendragonprojekt/common";
import {Ticket} from "../../models/ticket";
import {queueGroupName} from "./queue-group-name";


export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: TicketUpdatedEvent["data"], msg: Message): Promise<void> {
        const {id, title, price, version} = data;
        const ticket = await Ticket.findByEvent(data);

        if (!ticket) {
            throw new Error(`Ticket not found: ${id} | ${title} | ${version}`)
        }

        ticket.set({title, price});
        await ticket.save();

        msg.ack();
    }

}
