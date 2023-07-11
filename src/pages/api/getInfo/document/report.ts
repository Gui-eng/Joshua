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
        case 'POST':
            {
                try {
                    let { from, to } = req.body;
		    let fromDate = new Date(from);
		   // const FromDate = fromDate.getDate() - 1;
		    const toDate = new Date(to);
 		    const day = toDate.getDate() + 1;
		    toDate.setDate(day);
                    const salesInvoice = await prisma.salesInvoice.findMany({
                        where: {
                            dateIssued: {
                                gte: new Date(from).toISOString(),
                                lte: toDate.toISOString(),
                            },
                        },
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
                        where: {
                            dateIssued: {
                                gte: new Date(from).toISOString(),
                                lte: new Date(to).toISOString(),
                            },
                        },
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

			salesInvoice.sort((a, b) => {return new Date(a.dateIssued) - new Date(b.dateIssued)})
			deliveryRecipt.sort((a, b) => {return new Date(a.dateIssued) - new Date(b.dateIssued)})

                    const info = [...salesInvoice, ...deliveryRecipt];

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
