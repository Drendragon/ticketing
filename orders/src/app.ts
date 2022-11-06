import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from "cookie-session";
import {errorHandler, NotFoundError, currentUser} from "@drendragonprojekt/common";
import {indexOrdersRouter} from "./routes";
import {deleteOrdersRouter} from "./routes/delete";
import {showOrdersRouter} from "./routes/show";
import {createOrderRouter} from "./routes/new";

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test"
}));
app.use(currentUser)

app.use(indexOrdersRouter);
app.use(showOrdersRouter);
app.use(createOrderRouter);
app.use(deleteOrdersRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app};
