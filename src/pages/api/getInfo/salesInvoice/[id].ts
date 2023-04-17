import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
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
        case 'GET':
            {
                try {
                    const info = await prisma.salesInvoice.findUnique({
                        where: { id: req.query.id?.toString() },
                        include: {
                            pmr: { include: { employeeInfo: true } },
                            preparedBy: { include: { employeeInfo: true } },
                            client: { include: { clientInfo: true } },
                            TotalDetails: true,
                            items: {
                                include: {
                                    ItemInfo: {
                                        include: {
                                            ItemPrice: true,
                                        },
                                    },
                                },
                            },
                        },
                    });

                    if (!info) {
                        res.status(403).json({ success: false, data: [] });
                    }
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
