import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

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
                    const items = await prisma.stocks.findMany({
                        where: { itemInfoId: req.query.id?.toString() },
                    });

                    let vial = 0,
                        box = 0,
                        bottle = 0,
                        piece = 0;

                    const totalRemaining = items.map((items: any) => {
                        return {
                            stocksVial: vial + items.stocksVial,
                            stocksBox: box + items.stocksBox,
                            stocksBottle: bottle + items.stocksBottle,
                            stocksPiece: piece + items.stocksPiece,
                        };
                    });

                    res.status(200).json({ success: true, data: totalRemaining });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [] });
                }
            }
            break;
        case 'POST':
            {
                try {
                    const info = await prisma.itemInfo.create({ data: req.body });
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
