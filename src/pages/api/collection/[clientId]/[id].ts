import { PrismaClient } from '@prisma/client';
import { handleUndefined } from 'functions';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

const prisma = new PrismaClient();

type Data = {
    success: Boolean;
    data: any;
};

export const config = {
    api: {
        bodyParser: false,
    },
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
                    let info = await prisma.paymentInfo.findMany({
                        where: {
                            clientInfoId: handleUndefined(req.query.clientId),
                            OR: [
                                { salesInvoice: { id: handleUndefined(req.query.id) } },
                                { deliveryRecipt: { id: handleUndefined(req.query.id) } },
                            ],
                        },
                        include: { salesInvoice: true, deliveryRecipt: true },
                    });

                    if (!info) {
                        res.status(403).json({ success: false, data: info });
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
