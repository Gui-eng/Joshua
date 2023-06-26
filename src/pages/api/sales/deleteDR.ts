import { ItemSalesDetails, PrismaClient } from '@prisma/client';
import { handleUndefined, handleUnits } from 'functions';
import { create } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { Item } from 'types';

const prisma = new PrismaClient();
console.log('TEST');

enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    PER_PIECE = 'PER_PIECE',
}
interface data {
    id: string;
    firstName: string;
    middleInitial: string;
    lastName: string;
    role: string;
    idNumber: string;
}

type Data = {
    success: Boolean;
    data: data[] | Object;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await NextCors(req, res, {
        // Options
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const { method } = req;
    switch (method) {
        case 'POST':
            {
                try {
                    const { id, items } = req.body;

                    const makeItCompatible = items.map((item: any) => {
                        return {
                            ...item,
                            itemSalesDetails: item.ItemSalesDetails[0],
                        };
                    });

                    console.log([id, makeItCompatible]);

                    const deleteEmps = await prisma.$transaction([
                        prisma.employee.deleteMany({
                            where: { DeliveryReciptId: id.toString() },
                        }),

                        prisma.client.deleteMany({
                            where: { delveryReciptId: id.toString() },
                        }),
                    ]);

                    const deleteItemSalesDetailsPromises = makeItCompatible.map((obj: any) => {
                        return prisma.itemSalesDetails.delete({
                            where: { id: obj.itemSalesDetails.id },
                        });
                    });

                    const deleteItems = makeItCompatible.map((obj: any) => {
                        return prisma.item.delete({
                            where: { id: obj.id.toString() },
                        });
                    });

                    const deletedItemSalesDetails = await prisma.$transaction([
                        ...deleteItemSalesDetailsPromises,
                        ...deleteItems,
                    ]);

                    const deleteDocument = await prisma.deliveryRecipt.delete({
                        where: { id: id.toString() },
                    });

                    res.status(200).json({ success: true, data: [] });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [] });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: [] });
            break;
    }
}
