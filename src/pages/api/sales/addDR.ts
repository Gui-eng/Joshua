import { PrismaClient } from '@prisma/client';
import { conforms, create, update } from 'lodash';
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

enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    PER_PIECE = 'PER_PIECE',
}

type Data = {
    success: Boolean;
    data: data[] | Object;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'POST':
            {
                try {
                    const {
                        currentDate,
                        totalAmount,
                        term,
                        discount,
                        VAT,
                        preparedBy,
                        items,
                        remarks,
                        clientId,
                        stockIn,
                    } = req.body;
                    const itemArr = items.map((item: any) => {
                        return {
                            quantity: item.quantity,
                            unit: item.unit,
                            discount: item.discount,
                            vatable: item.VAT === 'Yes' ? true : false,
                            totalAmount: item.amount,
                            itemInfoId: item.itemId,
                        };
                    });

                    const data = {
                        currentDate: currentDate,
                        totalAmount: totalAmount,
                        Term: term,
                        discount: discount,
                        VAT: VAT,
                        items: {
                            createMany: {
                                data: itemArr,
                            },
                        },
                        remarks: remarks,
                        stockIn: stockIn,
                    };
                    console.log(itemArr);

                    const info = await prisma.deliveryRecipt.create({
                        data: data,
                    });

                    const preparedByEmp = await prisma.employee.create({
                        data: {
                            employeeInfoId: preparedBy,
                            DeliveryReciptId: info.id,
                        },
                    });

                    const client = await prisma.client.create({
                        data: {
                            clientInfoId: clientId,
                            delveryReciptId: info.id,
                        },
                    });

                    const updateInfo = await prisma.deliveryRecipt.update({
                        where: { id: info.id },
                        data: {
                            employeeId: preparedByEmp.id,
                            clientId: client.id,
                        },
                    });

                    if (stockIn) {
                        items.map(async (item: any) => {
                            const itemToUpdate = await prisma.stocks.findFirstOrThrow({
                                where: { itemInfoId: item.itemId },
                            });

                            console.log(itemToUpdate);

                            switch (item.unit) {
                                case UNITS.VIALS:
                                    await prisma.stocks.update({
                                        where: { id: itemToUpdate?.id },
                                        data: { stocksVial: itemToUpdate?.stocksVial + item.quantity },
                                    });
                                    break;
                                case UNITS.BOTTLES:
                                    await prisma.stocks.update({
                                        where: { id: itemToUpdate?.id },
                                        data: { stocksBottle: itemToUpdate?.stocksBottle + item.quantity },
                                    });
                                    break;
                                case UNITS.BOX:
                                    await prisma.stocks.update({
                                        where: { id: itemToUpdate?.id },
                                        data: { stocksBox: itemToUpdate?.stocksBox + item.quantity },
                                    });
                                    break;
                                case UNITS.PER_PIECE:
                                    await prisma.stocks.update({
                                        where: { id: itemToUpdate?.id },
                                        data: { stocksPiece: itemToUpdate?.stocksPiece + item.quantity },
                                    });
                                    break;
                                default:
                                    break;
                            }
                        });
                    } else {
                        items.map(async (item: any) => {
                            const itemToUpdate = await prisma.stocks.findFirstOrThrow({
                                where: { itemInfoId: item.itemId },
                            });
                            switch (item.unit) {
                                case UNITS.VIALS:
                                    await prisma.stocks.update({
                                        where: { id: itemToUpdate?.id },
                                        data: {
                                            stocksVial:
                                                itemToUpdate?.stocksVial === undefined
                                                    ? 0
                                                    : itemToUpdate?.stocksVial - item.quantity,
                                        },
                                    });
                                    break;
                                case UNITS.BOTTLES:
                                    await prisma.stocks.update({
                                        where: { id: itemToUpdate?.id },
                                        data: {
                                            stocksVial:
                                                itemToUpdate?.stocksBottle === undefined
                                                    ? 0
                                                    : itemToUpdate?.stocksBottle - item.quantity,
                                        },
                                    });
                                    break;
                                case UNITS.BOX:
                                    await prisma.stocks.update({
                                        where: { id: itemToUpdate?.id },
                                        data: {
                                            stocksVial:
                                                itemToUpdate?.stocksBox === undefined
                                                    ? 0
                                                    : itemToUpdate?.stocksBox - item.quantity,
                                        },
                                    });
                                    break;
                                case UNITS.PER_PIECE:
                                    await prisma.stocks.update({
                                        where: { id: itemToUpdate?.id },
                                        data: {
                                            stocksVial:
                                                itemToUpdate?.stocksPiece === undefined
                                                    ? 0
                                                    : itemToUpdate?.stocksPiece - item.quantity,
                                        },
                                    });
                                    break;
                                default:
                                    break;
                            }
                        });
                    }

                    res.status(200).json({ success: true, data: [] });
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
