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
                const {
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
                } = req.body;

                const { grossAmount, netAmount, vatExempt, VATAmount, netVATAmount, VATableSales, nonVATSales } = total;

                console.log(isRemote);
                const salesInvoice = await prisma.salesInvoice.create({
                    data: {
                        dateIssued: dateIssued,
                        salesInvoiceNumber: salesInvoiceNumber,
                        term: term,
                        totalAmount: totalAmount,
                        remarks: remarks,
                        VAT: VAT,
                        isRemote: !isRemote,
                        stockIn: stockIn,
                        payables: totalAmount,
                    },
                });

                const totalDetails = await prisma.totalDetails.create({
                    data: {
                        grossAmount: grossAmount,
                        netAmount: netAmount,
                        vatable: vatExempt,
                        VATAmount: VATAmount,
                        discount: 0,
                        salesInvoiceId: salesInvoice.id,
                    },
                });

                const preparedBy = await prisma.employee.create({
                    data: {
                        SalesInvoiceId: salesInvoice.id,
                        employeeInfoId: preparedById,
                    },
                });

                const pmr = await prisma.employee.create({
                    data: {
                        SalesInvoiceId: salesInvoice.id,
                        employeeInfoId: pmrEmployeeId,
                    },
                });

                const clientCreation = await prisma.client.create({
                    data: {
                        clientInfoId: clientId,
                        salesInvoiceId: salesInvoice.id,
                    },
                });

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

                const salesDetails = item.map((obj: any) => {
                    const { itemSalesDetails, id } = obj;

                    const { VATAmount, grossAmount, itemId, netAmount } = itemSalesDetails;

                    const sales = {
                        discount: handleUndefined(itemSalesDetails.discount),
                        grossAmount: grossAmount,
                        netAmount: netAmount,
                        netVATAmount: netAmount - netAmount * 0.12,
                        VATAmount: VATAmount,
                        vatExempt: !itemSalesDetails.vatable,
                        itemId: itemId,
                    };

                    return sales;
                });

                const handleItems = await prisma.item.createMany({
                    data: itemDetails,
                });

                const handleSales = await prisma.itemSalesDetails.createMany({
                    data: salesDetails,
                });

                const updateSalesInvoice = await prisma.salesInvoice.update({
                    where: { salesInvoiceNumber: salesInvoiceNumber },
                    data: {
                        pmrEmployeeId: pmr.id,
                        preparedById: preparedBy.id,
                        clientId: clientCreation.id,
                    },
                });
                try {
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
