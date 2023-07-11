import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

const prisma = new PrismaClient();



export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
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
                    const data = await prisma.itemInfo.findUnique({
                        where: { id: req.query.id?.toString() },
                        include : {
                            ItemPrice : true,
                        }
                    });

                    const info = {...data, ItemPrice : data?.ItemPrice[0] || {}}

                    res.status(200).json({ success: true, data: info });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [], items: [], stocks: [] });
                }
            }
            break;
        case 'POST':
            {
                try {
                    const info = await prisma.itemInfo.create({ data: req.body });
                    res.status(200).json({ success: true, data: info, items: [], stocks: [] });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [], items: [], stocks: [] });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: [], items: [], stocks: [] });
            break;
    }
}
