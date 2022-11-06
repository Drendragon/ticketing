import {Subjects, Publisher, PaymentCreatedEvent} from "@drendragonprojekt/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;

}
