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
                    const info = await prisma.proofOfDelivery.findMany({
                        include : {deliveredClient : true}
                    });

                    res.status(200).json({ success: true, data: info });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: null });
                }
            }
            break;
        case 'POST':
            {
                try {
                    const { number, dateIssued, items, deliveredTo, pmr } = req.body;

                    const data = items.map((item: any): Partial<proofOfDelivery> => {
                        return {
                            dateRequested: dateIssued,
                            deliveredClientId: deliveredTo,
                            itemInfoId: item.itemInfo.id,
                            pmrId: pmr,
                            proofOfDeliveryNumber: number,
                            quantity: item.quantity,
                            unit: item.unit,
                            remarks: item.remarks,
                        };
                    });

                    const info = await prisma.proofOfDelivery.createMany({
                        data: data,
                    });

                    res.status(200).json({ success: true, data: [] });
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
