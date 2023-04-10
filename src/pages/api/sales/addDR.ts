import { ItemSalesDetails, PrismaClient } from '@prisma/client';
import { handleUndefined, handleUnits } from 'functions';
import { create, uniqueId } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Item } from 'types';

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
                    deliveryReciptNumber,
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

                const deliveryRecipt = await prisma.deliveryRecipt.create({
                    data: {
                        dateIssued: dateIssued,
                        deliveryReciptNumber: deliveryReciptNumber,
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
                        deliveryReciptId: deliveryRecipt.id,
                    },
                });

                const preparedBy = await prisma.employee.create({
                    data: {
                        DeliveryReciptId: deliveryRecipt.id,
                        employeeInfoId: preparedById,
                    },
                });

                const pmr = await prisma.employee.create({
                    data: {
                        DeliveryReciptId: deliveryRecipt.id,
                        employeeInfoId: pmrEmployeeId,
                    },
                });

                const clientCreation = await prisma.client.create({
                    data: {
                        clientInfoId: clientId,
                        delveryReciptId: deliveryRecipt.id,
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
                        dRId: deliveryRecipt.id,
                    };
                });

                const salesDetails = item.map((obj: any) => {
                    const { itemSalesDetails } = obj;

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

                const updateDeliveryRecipt = await prisma.deliveryRecipt.update({
                    where: { deliveryReciptNumber: deliveryReciptNumber },
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
