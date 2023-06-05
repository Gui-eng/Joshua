import { PrismaClient, proofOfDelivery } from '@prisma/client';
import { handleUndefined } from 'functions';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { ItemInfo } from 'types';

const prisma = new PrismaClient();

interface Data {
    success: boolean;
    data: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await NextCors(req, res, {
        // Options
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    const info = await prisma.stockRequest.findMany({
                        include: { requestedBy: true },
                    });

                    res.status(200).json({ success: true, data: info });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: null });
                }
            }
            break;
        case 'POST':
            {
                try {
                    const { client, dateIssued, itemInfoId, quantity, unit } = req.body;

                    const report = await prisma.changeStock.create({
                        data: {
                            dateIssued: dateIssued,
                            quantity: quantity,
                            unit: unit,
                            itemInfoId: itemInfoId,
                        },
                    });

                    const mainStocks = await prisma.mainStocks.findFirst({
                        where: {
                            itemInfoId: itemInfoId,
                        },
                    });

                    switch (unit) {
                        case 'VIALS':
                            {
                                await prisma.mainStocks.update({
                                    where: { id: mainStocks?.id.toString() },
                                    data: {
                                        Vial: quantity,
                                    },
                                });
                            }
                            break;
                        case 'BOX':
                            {
                                await prisma.mainStocks.update({
                                    where: { id: mainStocks?.id.toString() },
                                    data: {
                                        Box: quantity,
                                    },
                                });
                            }
                            break;
                        case 'BOTTLES':
                            {
                                await prisma.mainStocks.update({
                                    where: { id: mainStocks?.id.toString() },
                                    data: {
                                        Bottle: quantity,
                                    },
                                });
                            }
                            break;
                        case 'CAPSULES':
                            {
                                await prisma.mainStocks.update({
                                    where: { id: mainStocks?.id.toString() },
                                    data: {
                                        Capsule: quantity,
                                    },
                                });
                            }
                            break;
                        case 'TABLETS':
                            {
                                await prisma.mainStocks.update({
                                    where: { id: mainStocks?.id.toString() },
                                    data: {
                                        Tablet: quantity,
                                    },
                                });
                            }
                            break;
                        default:
                            break;
                    }

                    res.status(200).json({ success: true, data: [] });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: null });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: null });
            break;
    }
}
