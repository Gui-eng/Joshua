import { PrismaClient } from '@prisma/client';
import { create } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    PER_PIECE = 'PER_PIECE',
}
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
                        pmrId,
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
                        term: term,
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

                    const info = await prisma.salesInvoice.create({
                        data: data,
                    });

                    const pmr = await prisma.employee.create({
                        data: {
                            employeeInfoId: pmrId,
                            SalesInvoiceId: info.id,
                        },
                    });

                    const prepare = await prisma.employee.create({
                        data: {
                            employeeInfoId: preparedBy,
                            SalesInvoiceId: info.id,
                        },
                    });

                    const client = await prisma.client.create({
                        data: {
                            clientInfoId: clientId,
                            salesInvoiceId: info.id,
                        },
                    });

                    const updateInfo = await prisma.salesInvoice.update({
                        where: { id: info.id },
                        data: {
                            pmrEmployeeId: pmr.id,
                            employeeId: prepare.id,
                            clientId: client.id,
                        },
                    });

                    if (stockIn) {
                        items.map(async (item: any) => {
                            const itemToUpdate = await prisma.stocks.findFirstOrThrow({
                                where: { itemInfoId: item.itemId },
                            });

                            switch (item.unit) {
                                case UNITS.VIALS:
                                    await prisma.stocks.update({
                                        where: { id: itemToUpdate?.id },
                                        data: { stocksVial: itemToUpdate?.stocksVial + item.quantity },
                                    });
                                    break;
                                case UNITS.BOTTLES:
                                    await prisma.itemInfo.update({
                                        where: { id: itemToUpdate?.id },
                                        data: { stocksVial: itemToUpdate?.stocksVial + item.quantity },
                                    });
                                    break;
                                case UNITS.BOX:
                                    await prisma.itemInfo.update({
                                        where: { id: itemToUpdate?.id },
                                        data: { stocksVial: itemToUpdate?.stocksVial + item.quantity },
                                    });
                                    break;
                                case UNITS.PER_PIECE:
                                    await prisma.itemInfo.update({
                                        where: { id: itemToUpdate?.id },
                                        data: { stocksVial: itemToUpdate?.stocksVial + item.quantity },
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
                                    await prisma.itemInfo.update({
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
                                    await prisma.itemInfo.update({
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
                                    await prisma.itemInfo.update({
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
                                    await prisma.itemInfo.update({
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
