import { PrismaClient, proofOfDelivery } from '@prisma/client';
import { handleUndefined } from 'functions';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { ItemInfo } from 'types';

const prisma = new PrismaClient();

interface Data {
    success: boolean;
    data: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await NextCors(req, res, {
        // Options
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    const info = await prisma.stockRequest.findMany({
                        include: { requestedBy: true },
                    });

                    res.status(200).json({ success: true, data: info });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: null });
                }
            }
            break;
        case 'POST':
            {
                try {
                    const { number, dateIssued, items, deliveredToAddress, requestedBy } = req.body;

                    console.log('PMR : ' + requestedBy);
                    const data = items.map((item: any) => {
                        return {
                            dateRequested: dateIssued,
                            deliveredAddress: deliveredToAddress,
                            quantityIssued: item.quantityIssued,
                            quantityRequested: item.quantityRequested,
                            stockRequestNumber: number,
                            unit: item.unit,
                            itemInfoId: item.itemInfo.id,
                            requestedById: requestedBy,
                            remarks: item.remarks,
                        };
                    });

                    const info = await prisma.stockRequest.createMany({
                        data: data,
                    });

                    await items.map(async (item: any) => {
                        const mainStocks = await prisma.mainStocks.findFirst({
                            where: { itemInfoId: item.itemInfo.id },
                        });

                        const pmr = await prisma.employeeInfo.findUnique({
                            where: { id: requestedBy },
                        });

                        const pmrStocks = await prisma.stocks.findFirst({
                            where: { itemInfoId: item.itemInfo.id, pmrEmployeeId: requestedBy },
                        });

                        switch (item.unit) {
                            case 'VIALS':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Vial:
                                                handleUndefined(mainStocks?.Vial) > 0
                                                    ? handleUndefined(mainStocks?.Vial) - item.quantityIssued
                                                    : 0,
                                        },
                                    });
                                }
                                break;
                            case 'BOX':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Box:
                                                handleUndefined(mainStocks?.Box) > 0
                                                    ? handleUndefined(mainStocks?.Box) - item.quantityIssued
                                                    : 0,
                                        },
                                    });
                                }
                                break;
                            case 'BOTTLES':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Bottle:
                                                handleUndefined(mainStocks?.Bottle) > 0
                                                    ? handleUndefined(mainStocks?.Bottle) - item.quantityIssued
                                                    : 0,
                                        },
                                    });
                                }
                                break;
                            case 'CAPSULES':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Capsule:
                                                handleUndefined(mainStocks?.Capsule) > 0
                                                    ? handleUndefined(mainStocks?.Capsule) - item.quantityIssued
                                                    : 0,
                                        },
                                    });
                                }
                                break;
                            case 'TABLETS':
                                {
                                    await prisma.mainStocks.update({
                                        where: { id: mainStocks?.id.toString() },
                                        data: {
                                            Tablet:
                                                handleUndefined(mainStocks?.Tablet) > 0
                                                    ? handleUndefined(mainStocks?.Tablet) - item.quantityIssued
                                                    : 0,
                                        },
                                    });
                                }
                                break;
                            default:
                                break;
                        }

                        switch (item.unit) {
                            case 'VIALS':
                                {
                                    const updatePmr = await prisma.stocks.update({
                                        where: { id: pmrStocks?.id.toString() },
                                        data: {
                                            vial: handleUndefined(pmrStocks?.vial) + item.quantityIssued,
                                        },
                                    });
                                }
                                break;
                            case 'BOX':
                                {
                                    const updatePmr = await prisma.stocks.update({
                                        where: { id: pmrStocks?.id.toString() },
                                        data: {
                                            box: handleUndefined(pmrStocks?.box) + item.quantityIssued,
                                        },
                                    });
                                }
                                break;
                            case 'BOTTLES':
                                {
                                    const updatePmr = await prisma.stocks.update({
                                        where: { id: pmrStocks?.id.toString() },
                                        data: {
                                            bottle: handleUndefined(pmrStocks?.bottle) + item.quantityIssued,
                                        },
                                    });
                                }
                                break;
                            case 'CAPSULES':
                                {
                                    const updatePmr = await prisma.stocks.update({
                                        where: { id: pmrStocks?.id.toString() },
                                        data: {
                                            capsule: handleUndefined(pmrStocks?.capsule) + item.quantityIssued,
                                        },
                                    });
                                }
                                break;
                            case 'TABLETS':
                                {
                                    const updatePmr = await prisma.stocks.update({
                                        where: { id: pmrStocks?.id.toString() },
                                        data: {
                                            tablet: handleUndefined(pmrStocks?.tablet) + item.quantityIssued,
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
                    res.status(403).json({ success: false, data: null });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: null });
            break;
    }
}
