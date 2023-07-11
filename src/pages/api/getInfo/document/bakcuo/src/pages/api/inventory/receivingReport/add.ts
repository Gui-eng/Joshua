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
                    const { receivingReportNumber, supplier, TIN, dateIssued, address, remarks, term, items } =
                        req.body;

                    const report = await prisma.receivingReport.create({
                        data: {
                            supplier: supplier,
                            address: address,
                            dateIssued: dateIssued,
                            receivingReportNumber: receivingReportNumber,
                            term: term,
                            TIN: TIN,
                            remarks: remarks,
                        },
                    });

                    const itemList = items.map((item: any) => {
                        return {
                            ...item,
                            receivingReportId: report.id,
                        };
                    });

                    await prisma.receivingReportItems.createMany({
                        data: itemList,
                    });

                    await items.map(async (item: any) => {
                        const { itemName, batchNumber, VAT, expirationDate, manufacturingDate, unit, quantity } = item;
                        const addItem = await prisma.itemInfo.create({
                            data: {
                                batchNumber: batchNumber,
                                expirationDate: expirationDate,
                                itemName: itemName,
                                manufacturingDate: manufacturingDate,
                                VAT: VAT,
                                isActive: true,
                            },
                        });

                        const price = await prisma.itemPrice.create({
                            data: {
                                itemInfoId: addItem.id,
                                bottle: 0,
                                box: 0,
                                capsule: 0,
                                tablet: 0,
                                vial: 0,
                            },
                        });

                        const pmr = await prisma.employeeInfo.findMany({
                            where: {
                                department: 'PMR',
                            },
                        });

                        pmr.map(async (pmr) => {
                            await prisma.stocks.create({
                                data: {
                                    pmrEmployeeId: pmr.id,
                                    itemInfoId: addItem.id,
                                },
                            });
                        });

                        const mainStocks = await prisma.mainStocks.create({
                            data: {
                                itemInfoId: addItem.id,
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
                    res.status(403).json({ success: false, data: null });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: null });
            break;
    }
}
