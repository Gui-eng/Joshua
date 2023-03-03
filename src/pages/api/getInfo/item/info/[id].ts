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
    data: any;
    items: Array<any>;
    stocks: Array<any>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    const info = await prisma.itemInfo.findUnique({
                        where: { id: req.query.id?.toString() },
                    });

                    const stocks = await prisma.stocks.findMany({
                        where: { itemInfoId: req.query.id?.toString() },
                        select: { stocksBottle: true, stocksBox: true, stocksPiece: true, stocksVial: true },
                    });

                    let items = await prisma.item.findMany({
                        where: { itemInfoId: req.query.id?.toString() },
                        include: {
                            ItemInfo: true,
                            DR: { include: { client: { include: { clientInfo: true } } } },
                            SI: { include: { client: { include: { clientInfo: true } } } },
                        },
                    });

                    res.status(200).json({ success: true, data: info, items: items, stocks: stocks });
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
