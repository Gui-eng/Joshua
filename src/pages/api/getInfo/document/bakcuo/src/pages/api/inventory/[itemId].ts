import { PrismaClient, proofOfDelivery } from '@prisma/client';
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
                    const pod = await prisma.proofOfDelivery.findMany({
                        where: {
                            itemInfoId: req.query.itemId?.toString(),
                        },
                        include: {
                            pmr: true,
                            deliveredClient: true,
                            itemInfo: true,
                        },
                    });

                    const stockRequest = await prisma.stockRequest.findMany({
                        where: {
                            itemInfoId: req.query.itemId?.toString(),
                        },
                        include: {
                            requestedBy: true,
                        },
                    });

                    const podEdited = pod.map((item) => {
                        return {
                            id: item.id,
                            type: 'POD',
                            dateIssued: item.dateRequested,
                            client: {
                                clientInfo: item.deliveredClient,
                            },
                            quantity: item.quantity,
                            remarks: item.remarks,
                            number: item.proofOfDeliveryNumber,
                        };
                    });

                    const sr = stockRequest.map((item) => {
                        return {
                            id: item.id,
                            type: 'SR',
                            dateIssued: item.dateRequested,
                            client: {
                                clientInfo: {
                                    companyName:
                                        item.requestedBy.code +
                                        ' ' +
                                        item.requestedBy.firstName +
                                        ' ' +
                                        item.requestedBy.lastName,
                                },
                            },
                            quantity: item.quantityIssued,
                            remarks: item.remarks,
                            number: item.stockRequestNumber,
                        };
                    });

                    const info = [...podEdited, ...sr];

                    res.status(200).json({ success: true, data: info });
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
