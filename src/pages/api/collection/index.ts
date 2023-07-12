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

const deductFromSalesInvoiceBalance = async (
    objArr: Array<any>,
    amount: number,
    totalAmount: number,
): Promise<number> => {
    let remainingAmount: number = amount;
    let accumulatedBalance: number = 0;

    const sum = objArr.map((item: any) => parseFloat(item.balance)).reduce((total, balance) => total + balance, 0);

    await objArr.map(async (doc: any) => {
        if (sum > totalAmount) {
            if (doc.salesInvoiceNumber !== undefined) {
                if (parseFloat(doc.balance) > totalAmount) {
                    accumulatedBalance = totalAmount;

                    await prisma.salesInvoice.update({
                        where: { id: doc.id.toString() },
                        data: {
                            balance: parseFloat(doc.balance) - totalAmount,
                        },
                    });

                    return accumulatedBalance;
                } else {
                    accumulatedBalance = parseFloat(doc.balance);

                    await prisma.salesInvoice.update({
                        where: { id: doc.id.toString() },
                        data: {
                            balance: 0,
                        },
                    });
                }
            } else {
                if (parseFloat(doc.balance) > totalAmount) {
                    accumulatedBalance = totalAmount;

                    await prisma.deliveryRecipt.update({
                        where: { id: doc.id.toString() },
                        data: {
                            balance: parseFloat(doc.balance) - totalAmount,
                        },
                    });

                    return accumulatedBalance;
                } else {
                    accumulatedBalance = parseFloat(doc.balance);

                    await prisma.deliveryRecipt.update({
                        where: { id: doc.id.toString() },
                        data: {
                            balance: 0,
                        },
                    });
                }
            }
        } else if (sum === totalAmount) {
            await objArr.map(async (item: any) => {
                if (doc.salesInvoiceNumber !== undefined) {
                    await prisma.salesInvoice.update({
                        where: { id: doc.id.toString() },
                        data: {
                            balance: 0,
                        },
                    });
                } else {
                    await prisma.deliveryRecipt.update({
                        where: { id: doc.id.toString() },
                        data: {
                            balance: 0,
                        },
                    });
                }
            });
            return (accumulatedBalance = totalAmount);
        } else {
            await objArr.map(async (item: any) => {
                if (doc.salesInvoiceNumber !== undefined) {
                    await prisma.salesInvoice.update({
                        where: { id: doc.id.toString() },
                        data: {
                            balance: 0,
                        },
                    });
                } else {
                    await prisma.deliveryRecipt.update({
                        where: { id: doc.id.toString() },
                        data: {
                            balance: 0,
                        },
                    });
                }
            });
            accumulatedBalance = sum;
        }
    });

    return accumulatedBalance;
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
                    ARCR,
                    remarks,
                } = req.body;
                try {
                    let collectionData: PaymentInfo;
                    let dateStr = depositTime;
                    dateStr = dateStr.replace(':00Z', '.000Z');

                    if (modeOfPayment === PAYMENT.CHECK) {
                        collectionData = await prisma.paymentInfo.create({
                            data: {
                                remarks: remarks,
                                CRARNo: ARCR,
                                amount: amount,
                                checkDate: checkDate,
                                depositDateAndTime: dateStr,
                                modeOfPayment: modeOfPayment,
                                dateIssued: dateIssued,
                                ewt: ewt,
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
                    } else {
                        collectionData = await prisma.paymentInfo.create({
                            data: {
                                amount: amount,
                                checkNumber: checkNumber,
                                depositDateAndTime: dateOfDeposit,
                                modeOfPayment: modeOfPayment,
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

                                dateIssued: dateIssued,
                                clientInfoId: documentData !== undefined ? documentData.client.clientInfo.id : '',
                                status: 'SUCCESS',
                                remarks: remarks,
                            },
                        });
                    }

                    if (documentData.salesInvoiceNumber !== undefined) {
                        let remainingAmount: number = amount + Number(ewt);
                        let deductFromBalanceValue: number = 0;

                        const getPayables = await prisma.salesInvoice.findUnique({
                            where: { salesInvoiceNumber: documentData.salesInvoiceNumber },
                        });

                        const salesInvoices = await prisma.salesInvoice.findMany({
                            where: {
                                client: { clientInfoId: documentData.client.clientInfo.id.toString() },
                                balance: { gt: 0 },
                                salesInvoiceNumber: { not: documentData.salesInvoiceNumber },
                            },
                        });

                        const deliveryReceipts = await prisma.deliveryRecipt.findMany({
                            where: {
                                client: { clientInfoId: documentData.client.clientInfo.id.toString() },
                                balance: { gt: 0 },
                            },
                        });

                        const documents = [...salesInvoices, ...deliveryReceipts];

                        if (deductFromBalance && amount < parseFloat(handleUndefined(getPayables?.payables))) {
                            deductFromBalanceValue = await deductFromSalesInvoiceBalance(
                                documents,
                                amount,
                                handleUndefined(getPayables?.payables),
                            );

                            await prisma.paymentInfo.update({
                                where: { id: collectionData.id },
                                data: {
                                    fromBalance: deductFromBalanceValue,
                                },
                            });

                            remainingAmount = remainingAmount + deductFromBalanceValue;
                        }

                        const madePayment = await prisma.salesInvoice.update({
                            where: { id: documentData.id },
                            data: {
                                payables:
                                    parseFloat(handleUndefined(getPayables?.payables)) - remainingAmount <= 0
                                        ? 0
                                        : parseFloat(handleUndefined(getPayables?.payables)) - remainingAmount,
                                isPaid:
                                    parseFloat(handleUndefined(getPayables?.payables)) - remainingAmount <= 0
                                        ? true
                                        : false,
                                amountPaid: parseFloat(handleUndefined(getPayables?.amountPaid)) + remainingAmount,
                                balance:
                                    deductFromBalanceValue > parseFloat(handleUndefined(getPayables?.payables))
                                        ? deductFromBalanceValue - parseFloat(handleUndefined(getPayables?.payables))
                                        : amount > handleUndefined(getPayables?.payables)
                                        ? amount - handleUndefined(getPayables?.payables)
                                        : 0,
                            },
                        });
                    } else {
                        let remainingAmount: number = amount + Number(ewt);

                        const getPayables = await prisma.deliveryRecipt.findUnique({
                            where: { deliveryReciptNumber: documentData.deliveryReciptNumber },
                        });

                        const getDeliveryRecipt = await prisma.deliveryRecipt.findMany({
                            where: {
                                client: { clientInfoId: documentData.client.clientInfo.id.toString() },
                                balance: { gt: 0 },
                            },
                        });

                        const getSalesInvoice = await prisma.salesInvoice.findMany({
                            where: {
                                client: { clientInfoId: documentData.client.clientInfo.id.toString() },
                                balance: { gt: 0 },
                            },
                        });

                        const getDocument = [...getSalesInvoice, ...getDeliveryRecipt];

                        if (deductFromBalance && amount < parseFloat(handleUndefined(getPayables?.payables))) {
                            remainingAmount = await deductFromSalesInvoiceBalance(
                                getDocument,
                                amount,
                                parseFloat(documentData.totalAmount),
                            );
                        }

                        const madePayment = await prisma.deliveryRecipt.update({
                            where: { id: documentData.id },
                            data: {
                                payables:
                                    parseFloat(handleUndefined(getPayables?.payables)) - remainingAmount <= 0
                                        ? 0
                                        : parseFloat(handleUndefined(getPayables?.payables)) - remainingAmount,
                                isPaid:
                                    parseFloat(handleUndefined(getPayables?.payables)) - remainingAmount <= 0
                                        ? true
                                        : false,
                                amountPaid:
                                    parseFloat(handleUndefined(getPayables?.amountPaid)) +
                                    remainingAmount +
                                    (amount - remainingAmount),
                                balance:
                                    remainingAmount > parseFloat(handleUndefined(getPayables?.payables))
                                        ? remainingAmount - parseFloat(handleUndefined(getPayables?.payables))
                                        : 0,
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
        case 'GET':
            {
                try {
                    let info = await prisma.paymentInfo.findMany({
                        include: {
                            salesInvoice: {
                                include: {
                                    client: { include: { clientInfo: true } },
                                    pmr: { include: { employeeInfo: true } },
                                },
                            },
                            deliveryRecipt: {
                                include: {
                                    client: { include: { clientInfo: true } },
                                    pmr: { include: { employeeInfo: true } },
                                },
                            },
                        },
                    });

                    if (!info) {
                        res.status(403).json({ success: false, data: info });
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
