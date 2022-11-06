import {Ticket} from "../ticket";
import * as Mongoose from "mongoose";

describe("ticket concurrency test list", () => {
    it('implements optimistic concurrency protocol', async () => {
        const ticket = Ticket.build({
            title: "teszt",
            price: 5,
            userId: "asd"
        })

        await ticket.save();

        const firstInstance = await Ticket.findById(ticket.id);
        const secondInstance = await Ticket.findById(ticket.id);

        firstInstance!.set({
            price: 10
        });
        secondInstance!.set({
            price: 15
        });

        await firstInstance!.save();

        try {
            await secondInstance!.save();
        } catch ($e) {
            return;
        }

        throw new Error("Should not reach this point");

    });
    it('should increment version number', async () => {
        const ticket = Ticket.build({
            title: "teszt",
            price: 5,
            userId: "asd"
        })

        await ticket.save();
        expect(ticket.version).toEqual(0);
        await ticket.save();
        expect(ticket.version).toEqual(1);
        await ticket.save();
        expect(ticket.version).toEqual(2);
    })
})

