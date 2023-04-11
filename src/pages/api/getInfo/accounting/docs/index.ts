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
    data: data[] | Object;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    const dr = await prisma.deliveryRecipt.findMany({
                        where: { salesItemSummaryId: null },
                        select: { id: true },
                    });
                    const si = await prisma.salesInvoice.findMany({
                        where: { salesItemSummaryId: null },
                        select: { id: true },
                    });

                    const DR = dr.map((item: any) => {
                        return {
                            id: item.id,
                            doc: 'DR',
                        };
                    });

                    const SI = si.map((item: any) => {
                        return {
                            id: item.id,
                            doc: 'SI',
                        };
                    });

                    const info = [...DR, ...SI];
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
