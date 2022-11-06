import express, {Request, Response} from "express";
import {Order} from "../models/order";
import {NotFoundError, requireAuth} from "@drendragonprojekt/common";


const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findOne({
        userId: req.currentUser!.id,
        _id: req.params.orderId
    });

    if (!order) {
        throw new NotFoundError();
    }

    console.log(order);

    res.send(order);
});

export {router as showOrdersRouter}
