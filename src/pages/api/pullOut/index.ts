import { PrismaClient } from '@prisma/client';
import { handleUndefined } from 'functions';
import { includes } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

type Data = {
    success: Boolean;
    data: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'POST':
            {
                try {
                    const { client, status, dateIssued, clientId, pullOutNumber, address, data, totalAmount } =
                        req.body;

                    console.log(pullOutNumber);

                    const pullOut = await prisma.pullOut.createMany({
                        data: data.map((item: any) => {
                            return {
                                pullOutNumber: pullOutNumber,
                                dateIssued: dateIssued,
                                documentNumber: item.documentNumber,
                                quantity: item.quantity,
                                itemName: item.name,
                                manufacturingDate: item.mfgdate,
                                expirationData: item.expdate,
                                batchNumber: item.batchnumber,
                                amount: item.amount,
                                totalAmount: totalAmount,
                                remarks: item.remarks,

                                unit: item.unit,
                                status: status,

                                clientInfoId: clientId,
                            };
                        }),
                    });

                    data.map(async (item: any) => {
                        if (item.isSI) {
                            const bal = await prisma.salesInvoice.findUnique({
                                where: { salesInvoiceNumber: item.documentNumber },
                            });

                            await prisma.salesInvoice.update({
                                where: { salesInvoiceNumber: item.documentNumber },
                                data: {
                                    isPullout: true,
                                    balance: bal?.balance + item.amount,
                                    payables:
                                        handleUndefined(bal?.payables) - item.amount <= 0
                                            ? 0
                                            : handleUndefined(bal?.payables) - item.amount,
                                    totalAmount:
                                        handleUndefined(bal?.totalAmount) - item.amount <= 0
                                            ? 0
                                            : handleUndefined(bal?.totalAmount) - item.amount,
                                },
                            });
                        } else {
                            const bal = await prisma.deliveryRecipt.findUnique({
                                where: { deliveryReciptNumber: item.documentNumber },
                            });

                            await prisma.deliveryRecipt.update({
                                where: { deliveryReciptNumber: item.documentNumber },
                                data: {
                                    isPullout: true,
                                    balance: bal?.balance + item.amount,
                                    payables:
                                        handleUndefined(bal?.payables) - item.amount <= 0
                                            ? 0
                                            : handleUndefined(bal?.payables) - item.amount,
                                    totalAmount:
                                        handleUndefined(bal?.totalAmount) - item.amount <= 0
                                            ? 0
                                            : handleUndefined(bal?.totalAmount) - item.amount,
                                },
                            });
                        }
                    });

                    res.status(200).json({ success: true, data: [] });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [] });
                }
            }
            break;
        case 'GET':
            {
                try {
                    const pullOutData = await prisma.pullOut.findMany({
                        include: { client: true },
                    });

                    res.status(200).json({ success: true, data: pullOutData });
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
