import { PrismaClient } from '@prisma/client';
import { handleUndefined } from 'functions';
import { includes } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

const prisma = new PrismaClient();

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
                        const { quantity } = item;

                        if (item.isSI) {
                            const bal = await prisma.salesInvoice.findUnique({
                                where: { salesInvoiceNumber: item.documentNumber },
                            });

                            await prisma.salesInvoice.update({
                                where: { salesInvoiceNumber: item.documentNumber },
                                data: {
                                    isPullout: true,
                                    payables:
                                        handleUndefined(bal?.payables) - item.amount <= 0
                                            ? 0
                                            : handleUndefined(bal?.payables) - item.amount,
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
                                    payables:
                                        handleUndefined(bal?.payables) - item.amount <= 0
                                            ? 0
                                            : handleUndefined(bal?.payables) - item.amount,
                                },
                            });
                        }

                        const mainStocks = await prisma.mainStocks.create({
                            data: {
                                itemInfoId: item.id,
                            },
                        });

                        switch (item.unit) {
                            case 'VIALS':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Vial: handleUndefined(mainStocks?.Vial) + quantity,
                                        },
                                    });
                                }
                                break;
                            case 'BOX':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Box: handleUndefined(mainStocks?.Box) + quantity,
                                        },
                                    });
                                }
                                break;
                            case 'BOTTLES':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Bottle: handleUndefined(mainStocks?.Bottle) + quantity,
                                        },
                                    });
                                }
                                break;
                            case 'CAPSULES':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Capsule: handleUndefined(mainStocks?.Capsule) + quantity,
                                        },
                                    });
                                }
                                break;
                            case 'TABLETS':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Tablet: handleUndefined(mainStocks?.Tablet) + quantity,
                                        },
                                    });
                                }
                                break;
                            default:
                                break;
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
