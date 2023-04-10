import { PrismaClient } from '@prisma/client';
import { handleUndefined } from 'functions';
import _ from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

type Data = {
    success: Boolean;
    data: any;
    totalPaid: number;
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    let info = await prisma.paymentInfo.findMany({
                        where: {
                            OR: [
                                { salesInvoice: { id: handleUndefined(req.query.id) } },
                                { deliveryRecipt: { id: handleUndefined(req.query.id) } },
                            ],
                        },
                        include: { salesInvoice: true, deliveryRecipt: true },
                    });

                    const total = _(info).map('amount').map(Number).sum();

                    if (!info) {
                        res.status(403).json({ success: false, data: info, totalPaid: 0 });
                    }
                    res.status(200).json({ success: true, data: info, totalPaid: total });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [], totalPaid: 0 });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: [], totalPaid: 0 });
            break;
    }
}
