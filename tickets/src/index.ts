import mongoose from "mongoose";
import {DatabaseConnectionError} from "@drendragonprojekt/common";
import {app} from "./app";
import {natsWrapper} from "./nats-wrapper";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";
import {OrderCancelledListener} from "./events/listeners/order-cancelled-listener";

const bootstrap = async () => {

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

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI);
    } catch ($e) {
        console.error($e)
        process.exit();
    }


    app.listen(3000, () => {
        console.log("Tickets service is listening on port 3000.");
    });

};

bootstrap()


