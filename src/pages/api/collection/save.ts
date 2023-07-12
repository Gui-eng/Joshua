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
                const {
                    id,
                    checkNumber,
                    amount,
                    dateOfDeposit,
                    checkDepositDate,
                    ewt,
                    checkDate,
                    depositTime,
                    modeOfPayment,
                    documentData,
                    dateIssued,
                    deductFromBalance,
                    balance,
                    ARCR,
                    remarks,
                    prevAmount,
                    prevBal,
                } = req.body;

                try {
                    const dateIssuedString = dateIssued;
                    const dateIss = new Date(dateIssuedString);
                    const dateIssIso = dateIss.toISOString();

                    if (modeOfPayment === 'CHECK') {
                        let collectionData: PaymentInfo;
                        let dateStr = depositTime;
                        dateStr = dateStr.replace(':00Z', '.000Z');

                        const checkDateString = checkDate;
                        const date = new Date(checkDateString);
                        const isoStr = date.toISOString();

                        const check = await prisma.paymentInfo.update({
                            where: { id: id },
                            data: {
                                remarks: remarks,
                                CRARNo: ARCR,
                                amount: amount,
                                checkDate: isoStr,
                                depositDateAndTime: dateStr,
                                modeOfPayment: modeOfPayment,
                                dateIssued: dateIssIso,
                                ewt: Number(ewt),
                                salesInvoiceId:
                                    documentData !== undefined
                                        ? documentData.salesInvoiceNumber !== undefined
                                            ? documentData.id
                                            : null
                                        : null,
                                deliveryReciptId:
                                    documentData !== undefined
                                        ? documentData.salesInvoiceNumber === undefined
                                            ? documentData.id
                                            : null
                                        : null,
                                checkNumber: checkNumber,
                                clientInfoId: documentData !== undefined ? documentData.client.clientInfo.id : '',
                                status: 'SUCCESS',
                            },
                        });

                        if (documentData.salesInvoiceNumber !== undefined) {
                            const siInfo = await prisma.salesInvoice.findUnique({
                                where: { id: documentData.id },
                            });

                            const newBalance = Number(siInfo?.balance) + prevBal - balance;
                            const newPayables = Number(siInfo?.payables) + prevAmount - (amount + Number(ewt));
                            const newAmountPaid = amount + Number(ewt);

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

                            const newBalance = Number(drInfo?.balance) + prevBal - balance;
                            const newPayables = Number(drInfo?.payables) + prevAmount - (amount + Number(ewt));
                            const newAmountPaid = amount + Number(ewt);

                            const si = await prisma.deliveryRecipt.update({
                                where: { id: documentData.id },
                                data: {
                                    balance: newBalance <= 0 ? 0 : newBalance,
                                    payables: newPayables,
                                    amountPaid: newAmountPaid,
                                },
                            });
                        }

                        res.status(200).json({ success: true, data: [] });
                    } else {
                        const checkInfo = await prisma.paymentInfo.findUnique({
                            where: { id: id },
                        });

                        const dod = dateOfDeposit;
                        const dodDate = new Date(dod);
                        const dodISO = dodDate.toISOString();

                        const check = await prisma.paymentInfo.update({
                            where: { id: id },
                            data: {
                                remarks: remarks,
                                CRARNo: ARCR,
                                amount: amount,
                                depositDateAndTime: dodISO,
                                modeOfPayment: modeOfPayment,
                                dateIssued: dateIssIso,
                                ewt: Number(ewt),
                                salesInvoiceId:
                                    documentData !== undefined
                                        ? documentData.salesInvoiceNumber !== undefined
                                            ? documentData.id
                                            : null
                                        : null,
                                deliveryReciptId:
                                    documentData !== undefined
                                        ? documentData.salesInvoiceNumber === undefined
                                            ? documentData.id
                                            : null
                                        : null,
                                checkNumber: checkNumber,
                                clientInfoId: documentData !== undefined ? documentData.client.clientInfo.id : '',
                                status: 'SUCCESS',
                            },
                        });

                        if (documentData.salesInvoiceNumber !== undefined) {
                            const siInfo = await prisma.salesInvoice.findUnique({
                                where: { id: documentData.id },
                            });

                            const newBalance = Number(siInfo?.balance) + prevBal - balance;
                            const newPayables = +prevAmount - (amount + Number(ewt));
                            const newAmountPaid = amount + Number(ewt);

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

                            const newBalance = Number(drInfo?.balance) + prevBal - balance;
                            const newPayables = Number(drInfo?.payables) + prevAmount - (amount + Number(ewt));
                            const newAmountPaid = amount + Number(ewt);

                            const si = await prisma.deliveryRecipt.update({
                                where: { id: documentData.id },
                                data: {
                                    balance: newBalance <= 0 ? 0 : newBalance,
                                    payables: newPayables,
                                    amountPaid: newAmountPaid,
                                },
                            });
                        }

                        res.status(200).json({ success: true, data: [] });
                    }
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
