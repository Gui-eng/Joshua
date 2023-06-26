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
                    const info = await prisma.stockRequest.findMany({
                        where: {
                            stockRequestNumber: req.query.number?.toString(),
                        },
                        include: {
                            requestedBy: true,
                            itemInfo: true,
                        },
                    });

                    res.status(200).json({ success: true, data: info });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: null });
                }
            }
            break;
        case 'DELETE':
            {
                try {
                    const del = await prisma.stockRequest.deleteMany({
                        where: { stockRequestNumber: req.query.number?.toString() },
                    });

                    res.status(200).json({ success: true, data: req.query.number });
                } catch (error) {
                    res.status(403).json({ success: false, data: null });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: null });
            break;
    }
}
