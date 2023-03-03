import { PrismaClient } from '@prisma/client';
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
    data: data[] | Object | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    let info = null;
                    if (req.query.type === 'DR') {
                        info = await prisma.deliveryRecipt.findUnique({
                            where: { id: req.query.id?.toString() },
                            include: {
                                items: { include: { ItemInfo: true } },
                                client: { include: { clientInfo: true } },
                            },
                        });
                    } else if (req.query.type === 'SI') {
                        info = await prisma.salesInvoice.findUnique({
                            where: { id: req.query.id?.toString() },
                            include: {
                                items: { include: { ItemInfo: true } },
                                client: { include: { clientInfo: true } },
                            },
                        });
                    } else {
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
