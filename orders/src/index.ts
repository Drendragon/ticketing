import mongoose from "mongoose";
import {DatabaseConnectionError} from "@drendragonprojekt/common";
import {app} from "./app";
import {natsWrapper} from "./nats-wrapper";
import {TicketCreatedListener} from "./events/listeners/ticket-created-listener";
import {TicketUpdatedListener} from "./events/listeners/ticket-updated-listener";
import {ExpirationCompleteListener} from "./events/listeners/expiration-complete-listener";
import {PaymentCreatedListener} from "./events/listeners/payment-created-listener";

const bootstrap = async () => {

    console.log("Starting...");

    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY is missing");
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing");
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error("NATS_CLIENT_ID is missing");
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error("NATS_CLUSTER_ID is missing");
    }

    if (!process.env.NATS_URL) {
        throw new Error("NATS_URL is missing");
    }

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
        natsWrapper.client.on('close', () => {
            console.log("Closing NATS connection.");
            process.exit();
        });
        process.on('SIGINT', () => {
            natsWrapper.client.close()
        });
        process.on('SIGTERM', () => {
            natsWrapper.client.close()
        });

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI);
    } catch ($e) {
        console.error($e)
        process.exit();
    }


    app.listen(3000, () => {
        console.log("Orders service is listening on port 3000.");
    });

};

bootstrap()


