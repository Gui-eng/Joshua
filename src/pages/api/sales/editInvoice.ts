import { ItemSalesDetails, PrismaClient } from '@prisma/client';
import { handleUndefined, handleUnits } from 'functions';
import { create } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { Item } from 'types';

const prisma = new PrismaClient();
console.log('TEST');

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
    await NextCors(req, res, {
        // Options
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const { method } = req;
    switch (method) {
        case 'GET': {
            {
                try {
                    res.status(200).json({ success: true, data: ['haha'] });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [] });
                }
            }
            break;
        }
        case 'POST':
            {
                try {
                    // console.log(req.body.total);
                    const {
                        id,
                        dateIssued,
                        salesInvoiceNumber,
                        term,
                        totalAmount,
                        pmrEmployeeId,
                        clientId,
                        VAT,
                        remarks,
                        item,
                        isRemote,
                        client,
                        stockIn,
                        preparedById,
                        total,
                        lastItems,
                    } = req.body;

                    const { grossAmount, netAmount, vatExempt, VATAmount, netVATAmount, VATableSales, nonVATSales } =
                        total;

                    const salesInvoice = await prisma.salesInvoice.update({
                        where: { id: id.toString() },
                        data: {
                            dateIssued: dateIssued,
                            salesInvoiceNumber: salesInvoiceNumber,
                            term: term,
                            totalAmount: totalAmount,
                            remarks: remarks,
                            VAT: VAT,
                            isRemote: !isRemote,
                            payables: totalAmount,
                        },
                    });

                    const updateEmps = await prisma.$transaction([
                        prisma.employee.deleteMany({
                            where: { SalesInvoiceId: id.toString() },
                        }),

                        prisma.employee.create({
                            data: {
                                SalesInvoiceId: salesInvoice.id,
                                employeeInfoId: preparedById,
                            },
                        }),

                        prisma.employee.create({
                            data: {
                                SalesInvoiceId: salesInvoice.id,
                                employeeInfoId: pmrEmployeeId,
                            },
                        }),

                        prisma.client.deleteMany({
                            where: { salesInvoiceId: id },
                        }),

                        prisma.client.create({
                            data: {
                                clientInfoId: clientId,
                                salesInvoiceId: salesInvoice.id,
                            },
                        }),
                    ]);

                    const updateEmpsOnSi = await prisma.salesInvoice.update({
                        where: { id: salesInvoice.id },
                        data: {
                            pmrEmployeeId: updateEmps[2].id,
                            preparedById: updateEmps[1].id,
                            clientId: updateEmps[4].id,
                        },
                    });

                    // console.log(lastItems);

                    const itemDetails: Array<any> = item.map((obj: any) => {
                        const {
                            itemSalesDetails,
                            id,
                            quantity,
                            totalAmount,
                            unit,
                            unitPrice,
                            vatable,
                            ItemInfo,
                            discount,
                            itemInfoId,
                        } = obj;

                        return {
                            id: id,
                            quantity: quantity,
                            totalAmount: totalAmount,
                            unit: handleUnits(unit),
                            vatable: vatable,
                            discount: discount,
                            itemInfoId: handleUndefined(itemInfoId),
                            sIId: salesInvoice.id,
                        };
                    });

                    const deleteItemSalesDetailsPromises = lastItems.map((obj: any) => {
                        return prisma.itemSalesDetails.delete({
                            where: { id: obj.itemSalesDetails.id },
                        });
                    });

                    const deleteItems = lastItems.map((obj: any) => {
                        return prisma.item.delete({
                            where: { id: obj.id.toString() },
                        });
                    });

                    const deletedItemSalesDetails = await prisma.$transaction([
                        ...deleteItemSalesDetailsPromises,
                        ...deleteItems,
                    ]);

                    const salesDetails = item.map((obj: any) => {
                        const { itemSalesDetails, id } = obj;

                        const { VATAmount, grossAmount, itemId, netAmount } = itemSalesDetails;

                        console.log(grossAmount * Number(itemSalesDetails.discount));

                        const sales = {
                            discount: handleUndefined(itemSalesDetails.discount),
                            grossAmount: grossAmount,
                            netAmount: grossAmount - grossAmount * Number(itemSalesDetails.discount),
                            netVATAmount:
                                grossAmount -
                                grossAmount * Number(itemSalesDetails.discount) -
                                (grossAmount - (grossAmount * Number(itemSalesDetails.discount)) / 1.12) * 0.12,
                            VATAmount: VATAmount,
                            vatExempt: !itemSalesDetails.vatable,
                            itemId: id,
                        };

                        return sales;
                    });

                    // Delete the records from the item table
                    const deletedItems = await prisma.item.deleteMany({
                        where: { sIId: salesInvoice.id },
                    });

                    const deleted = await prisma.$transaction([
                        prisma.item.createMany({
                            data: itemDetails,
                        }),

                        prisma.itemSalesDetails.createMany({
                            data: salesDetails,
                        }),
                    ]);

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
