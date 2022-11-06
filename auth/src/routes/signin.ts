import {BadRequestException, validateRequest} from "@drendragonprojekt/common";
import express, {Request, Response} from "express";
import {body} from 'express-validator';
import {User} from "../models/user";
import {Password} from "../services/password";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid.'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password must be sent.')
], validateRequest, async (req: Request, res: Response) => {

    const {email, password} = req.body;

    const existingUser = await User.findOne({email});
    if (!existingUser) {
        throw new BadRequestException("Wrong email or password");
    }

    if (!await Password.compare(existingUser.password, password)) {
        throw new BadRequestException("Wrong email or password");
    }

    const userJwt = jwt.sign(
        {
            id: existingUser._id,
            email: existingUser.email
        },
        process.env.JWT_KEY!
    );

    req.session = {
        jwt: userJwt
    }

    res.status(201).send(existingUser);

});

export {router as signInRouter};
