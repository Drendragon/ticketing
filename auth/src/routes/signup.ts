import express, {Request, Response} from "express";
import {body} from "express-validator";
import {User} from "../models/user";
import {BadRequestException} from "@drendragonprojekt/common";
import jwt from 'jsonwebtoken';
import {validateRequest} from "@drendragonprojekt/common";

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid.'),
    body('password')
        .trim()
        .isLength({min: 8})
        .withMessage("Password must be at least 8 character")
], validateRequest, async (req: Request, res: Response) => {

    const {email, password} = req.body;

    const existingUser = await User.findOne({email});
    if (existingUser) {
        throw new BadRequestException("User is already exists.");
    }

    const user = User.build({email, password});
    await user.save();

    const userJwt = jwt.sign(
        {
            id: user._id,
            email: user.email
        },
        process.env.JWT_KEY!
    );

    req.session = {
        jwt: userJwt
    }

    res.status(201).send(user);
});

export {router as signUpRouter};
