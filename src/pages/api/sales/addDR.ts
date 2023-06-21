import { ItemSalesDetails, PrismaClient } from '@prisma/client';
import { handleUndefined, handleUnits } from 'functions';
import _, { create } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { Item } from 'types';
import { v4 as uuidv4 } from 'uuid';

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
                    deliveryReciptNumber,
                    term,
                    pmrEmployeeId,
                    clientId,
                    remarks,
                    item,
                    isRemote,
                    client,
                    preparedById,
                } = req.body;

                const record = await prisma.deliveryRecipt.findFirst({
                    where: {
                        deliveryReciptNumber: deliveryReciptNumber,
                    },
                });

                if (record) {
                    res.status(403).json({ success: false, data: ['There is already existing Number'] });
                    return;
                }

                const totalSalesAmount = _.sumBy(
                    item,
                    (item: any) => item.totalAmount - (item.totalAmount * handleUndefined(item.discount)) / 100,
                );

                const VAT = (totalSalesAmount / 1.12) * 0.12;

                const newID = uuidv4();
                let DRInfo: any = {
                    id: newID,
                    dateIssued: dateIssued,
                    deliveryReciptNumber: deliveryReciptNumber,
                    term: term,
                    totalAmount: totalSalesAmount,
                    remarks: remarks,
                    VAT: VAT,
                    isRemote: !isRemote,
                    payables: totalSalesAmount,
                };

                const itemData = item.map((item: any) => {
                    const { id, quantity, vatable, discount, totalAmount, itemInfoId, unit } = item;

                    const disc = handleUndefined(discount) / 100;
                    const grossAmount = totalAmount;
                    const netAmount = totalAmount - grossAmount * disc;
                    const VATAmount = vatable ? (netAmount / 1.12) * 0.12 : 0;

                    return {
                        id: id,
                        quantity: quantity,
                        totalAmount: netAmount,
                        unit: handleUnits(unit),
                        vatable: vatable,
                        discount: disc,
                        itemInfoId: handleUndefined(itemInfoId),
                        dRId: DRInfo.id,
                    };
                });

                const itemSalesData = item.map((item: any) => {
                    const { id, quantity, vatable, discount, totalAmount, itemInfoId, unit } = item;

                    const disc = handleUndefined(discount) / 100;
                    const grossAmount = totalAmount;
                    const netAmount = totalAmount - grossAmount * disc;
                    const VATAmount = vatable ? (netAmount / 1.12) * 0.12 : 0;

                    return {
                        discount: disc,
                        grossAmount: grossAmount,
                        netAmount: netAmount,
                        netVATAmount: netAmount - netAmount * 0.12,
                        VATAmount: VATAmount,
                        vatExempt: !vatable,
                        itemId: id,
                    };
                });

                const deliveryReceipt = await prisma.deliveryRecipt.create({
                    data: DRInfo,
                });

                const preparedBy = await prisma.employee.create({
                    data: {
                        DeliveryReciptId: deliveryReceipt.id,
                        employeeInfoId: preparedById,
                    },
                });

                const pmr = await prisma.employee.create({
                    data: {
                        DeliveryReciptId: deliveryReceipt.id,
                        employeeInfoId: pmrEmployeeId,
                    },
                });

                const clientCreation = await prisma.client.create({
                    data: {
                        clientInfoId: clientId,
                        delveryReciptId: deliveryReceipt.id,
                    },
                });

                const handleItems = await prisma.item.createMany({
                    data: itemData,
                });

                const handleSales = await prisma.itemSalesDetails.createMany({
                    data: itemSalesData,
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
