import {Publisher, OrderCancelledEvent, Subjects} from "@drendragonprojekt/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    readonly subject = Subjects.OrderCancelled;
}
