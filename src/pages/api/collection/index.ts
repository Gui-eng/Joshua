import { PAYMENT, PAYMENT_STATUS, PaymentInfo, PrismaClient } from '@prisma/client';
import { getDate, handleUndefined } from 'functions';
import type { NextApiRequest, NextApiResponse } from 'next';
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

    for (const obj of objArr) {
        if (remainingAmount <= 0) {
            break;
        }

        if (obj.balance > totalAmount) {
            const newBal = parseFloat(obj.balance) - totalAmount;
            accumulatedBalance = totalAmount;

            if (obj.salesInvoiceNumber !== undefined) {
                await prisma.salesInvoice.update({
                    where: { id: obj.id.toString() },
                    data: { balance: newBal },
                });
            } else {
                await prisma.deliveryRecipt.update({
                    where: { id: obj.id.toString() },
                    data: { balance: newBal },
                });
            }
        } else {
            accumulatedBalance += obj.balance;
            obj.balance = 0;
        }

        if (obj.balance === 0) {
            if (obj.salesInvoiceNumber !== undefined) {
                await prisma.salesInvoice.update({
                    where: { id: obj.id.toString() },
                    data: { balance: 0 },
                });
            } else {
                await prisma.deliveryRecipt.update({
                    where: { id: obj.id.toString() },
                    data: { balance: 0 },
                });
            }
        }
    }

    return accumulatedBalance;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;

    switch (method) {
        case 'POST':
            {
                const {
                    checkNumber,
                    amount,
                    dateOfDeposit,
                    checkDepositDate,
                    checkDate,
                    depositTime,
                    modeOfPayment,
                    documentData,
                    dateIssued,
                    deductFromBalance,
                } = req.body;
                try {
                    let collectionData: PaymentInfo;
                    if (modeOfPayment === PAYMENT.CHECK) {
                        collectionData = await prisma.paymentInfo.create({
                            data: {
                                amount: amount,
                                checkDate: checkDate,
                                depositDateAndTime: depositTime,
                                modeOfPayment: modeOfPayment,
                                dateIssued: dateIssued,
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
                            },
                        });
                    }

                    if (documentData.salesInvoiceNumber !== undefined) {
                        let remainingAmount: number = amount;

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
                            remainingAmount = await deductFromSalesInvoiceBalance(
                                documents,
                                amount,
                                parseFloat(documentData.totalAmount),
                            );
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
                    } else {
                        let remainingAmount: number = amount;

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
