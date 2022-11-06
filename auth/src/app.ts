import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';

import cookieSession from "cookie-session";

//Routes /api/users/?(.*)
import {currentUserRouter} from "./routes/current-user";
import {signInRouter} from "./routes/signin";
import {signOutRouter} from "./routes/signout";
import {signUpRouter} from "./routes/signup";

//Error handlers
import {errorHandler, NotFoundError} from "@drendragonprojekt/common";


const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test"
}));
app.use(currentUserRouter);
app.use(signUpRouter);
app.use(signInRouter);
app.use(signOutRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app};
