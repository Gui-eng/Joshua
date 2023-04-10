import { PrismaClient } from '@prisma/client';
import _ from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

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
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    const salesInvoice = await prisma.salesInvoice.findMany({
                        where: { client: { clientInfo: { id: req.query.id?.toString() } } },
                        select: { payables: true },
                    });

                    //This space is for delivery Recipt
                    const deliveryRecipt = await prisma.deliveryRecipt.findMany({
                        where: { client: { clientInfo: { id: req.query.id?.toString() } } },
                        select: { payables: true },
                    });

                    const documents = [...salesInvoice, ...deliveryRecipt];

                    const info = _.sumBy(documents, (document) => Number(document.payables));

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
