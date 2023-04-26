import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ItemInfo } from '../../../../../../types';
import NextCors from 'nextjs-cors';

const prisma = new PrismaClient();

type Data = {
    success: Boolean;
    data: any;
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
                const { batchNumber, VAT, expirationDate, itemName, manufacturingDate, price }: ItemInfo = req.body;
                try {
                    const item = await prisma.itemInfo.update({
                        where: { id: req.query.id?.toString() },
                        data: {
                            batchNumber: batchNumber,
                            expirationDate: expirationDate,
                            itemName: itemName,
                            manufacturingDate: manufacturingDate,
                            VAT: VAT,
                            ItemPrice: {
                                update: {
                                    where: { id: price?.id },
                                    data: {
                                        bottle: price?.bottle,
                                        box: price?.box,
                                        capsule: price?.capsule,
                                        tablet: price?.tablet,
                                        vial: price?.vial,
                                    },
                                },
                            },
                        },
                    });

                    const stockUdate = await prisma.stocks.updateMany({
                        where: { itemInfoId: item.id.toString() },
                        data: {
                            itemInfoId: item.id.toString(),
                        },
                    });

                    res.status(200).json({ success: true, data: item });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [] });
                }
            }
            break;
        case 'DELETE':
            {
                try {
                    const info = await prisma.itemInfo.delete({
                        where: {
                            id: req.query.id?.toString(),
                        },
                    });
                    res.status(200).json({ success: true, data: info });
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
