import {Publisher, ExpirationCompleteEvent, Subjects} from "@drendragonprojekt/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
