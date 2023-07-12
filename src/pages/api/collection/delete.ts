import { PAYMENT, PAYMENT_STATUS, PaymentInfo, PrismaClient } from '@prisma/client';
import { getDate, handleUndefined } from 'functions';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { CheckInfo } from 'types';

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
                const { id, documentData, prevAmount, ewt, prevBal } = req.body;

                try {
                    const payment = await prisma.paymentInfo.delete({
                        where: { id: id },
                    });

                    if (documentData.salesInvoiceNumber !== undefined) {
                        const siInfo = await prisma.salesInvoice.findUnique({
                            where: { id: documentData.id },
                        });

                        const newBalance = Number(siInfo?.balance) + prevBal;
                        const newPayables = Number(siInfo?.payables) + prevAmount;
                        const newAmountPaid = Number(siInfo?.amountPaid) - prevAmount;

                        const si = await prisma.salesInvoice.update({
                            where: { id: documentData.id },
                            data: {
                                balance: newBalance <= 0 ? 0 : newBalance,
                                payables: newPayables,
                                amountPaid: newAmountPaid,
                            },
                        });
                    } else {
                        const drInfo = await prisma.deliveryRecipt.findUnique({
                            where: { id: id },
                        });

                        const newBalance = Number(drInfo?.balance) + prevBal;
                        const newPayables = Number(drInfo?.payables) + prevAmount;
                        const newAmountPaid = Number(drInfo?.amountPaid) - prevAmount;

                        const si = await prisma.deliveryRecipt.update({
                            where: { id: documentData.id },
                            data: {
                                balance: newBalance <= 0 ? 0 : newBalance,
                                payables: newPayables,
                            },
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
