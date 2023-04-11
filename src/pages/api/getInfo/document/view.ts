import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

type Data = {
    success: Boolean;
    data: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    const salesInvoice = await prisma.salesInvoice.findMany({
                        include: {
                            pmr: { include: { employeeInfo: true } },
                            preparedBy: { include: { employeeInfo: true } },
                            items: {
                                include: {
                                    ItemInfo: { include: { ItemPrice: true } },
                                    ItemSalesDetails: true,
                                },
                            },
                            client: { include: { clientInfo: true } },
                        },
                    });

                    const deliveryRecipt = await prisma.deliveryRecipt.findMany({
                        include: {
                            pmr: { include: { employeeInfo: true } },
                            preparedBy: { include: { employeeInfo: true } },
                            items: {
                                include: {
                                    ItemInfo: { include: { ItemPrice: true } },
                                    ItemSalesDetails: true,
                                },
                            },
                            client: { include: { clientInfo: true } },
                        },
                    });

                    const info = [...salesInvoice, deliveryRecipt];

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
