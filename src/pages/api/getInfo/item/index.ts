import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { EmployeeInfo, ItemInfo } from '../../../../../types';

const prisma = new PrismaClient();

interface Data {
    success: boolean;
    data: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    const info: any = await prisma.itemInfo.findMany({
                        include: { ItemPrice: true },
                    });

                    const itemInfo = info.map((item: any) => {
                        return {
                            ...item,
                            ItemPrice: item.ItemPrice !== undefined ? item.ItemPrice[0] : null,
                        };
                    });

                    res.status(200).json({ success: true, data: itemInfo });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: null });
                }
            }
            break;
        case 'POST':
            {
                try {
                    const {
                        batchNumber,
                        expirationDate,
                        itemName,
                        manufacturingDate,
                        VAT,
                        price: { bottle, box, capsule, vial, tablet, itemInfoId },
                    } = req.body;

                    console.log();
                    const addItem = await prisma.itemInfo.create({
                        data: {
                            batchNumber: batchNumber,
                            expirationDate: expirationDate,
                            itemName: itemName,
                            manufacturingDate: manufacturingDate,
                            VAT: VAT,
                        },
                    });

                    const price = await prisma.itemPrice.create({
                        data: {
                            itemInfoId: addItem.id,
                            bottle: bottle,
                            box: box,
                            capsule: capsule,
                            tablet: tablet,
                            vial: vial,
                        },
                    });

                    const pmr = await prisma.employeeInfo.findMany({
                        where: {
                            department: 'PMR',
                        },
                    });

                    pmr.map(async (pmr) => {
                        await prisma.stocks.create({
                            data: {
                                pmrEmployeeId: pmr.id,
                                itemInfoId: addItem.id,
                            },
                        });
                    });

                    await prisma.mainStocks.create({
                        data: {
                            itemInfoId: addItem.id,
                        },
                    });

                    res.status(200).json({ success: true, data: addItem });
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
