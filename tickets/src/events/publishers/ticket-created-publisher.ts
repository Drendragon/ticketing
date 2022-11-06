import {Publisher, Subjects, TicketCreatedEvent} from "@drendragonprojekt/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated
}
