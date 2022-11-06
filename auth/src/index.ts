import mongoose from "mongoose";
import {DatabaseConnectionError} from "@drendragonprojekt/common";
import {app} from "./app";

const bootstrap = async () => {

    console.log('Starting up');

    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY is missing");
    }
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch ($e) {
        console.error($e)
        process.exit();
    }

    app.listen(3000, () => {
        console.log("Auth service is listening on port 3000.");
    });

};

bootstrap()


