import { PrismaClient } from '@prisma/client';
import { create } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

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
        case 'POST':
            {
                try {
                    const { currentDate, totalAmount, term, discount, VAT, preparedBy, pmrId, items } = req.body;
                    const itemArr = items[0].map((item: any) => {
                        return {
                            quantity: item.quantity,
                            unit: item.unit,
                            discount: item.discount,
                            vatable: item.VAT === 'Yes' ? true : false,
                            totalAmount: item.amount,
                            itemInfoId: item.itemId,
                        };
                    });
                    const info = await prisma.salesInvoice.create({
                        data: {
                            currentDate: currentDate,
                            totalAmount: totalAmount,
                            term: term,
                            discount: discount,
                            VAT: VAT,
                            items: {
                                createMany: {
                                    data: itemArr,
                                },
                            },
                        },
                    });

                    const pmr = await prisma.employee.create({
                        data: {
                            employeeInfoId: pmrId,
                            SalesInvoiceId: info.id,
                        },
                    });

                    const prepare = await prisma.employee.create({
                        data: {
                            employeeInfoId: preparedBy,
                            SalesInvoiceId: info.id,
                        },
                    });

                    const updateInfo = await prisma.salesInvoice.update({
                        where: { id: info.id },
                        data: {
                            pmrEmployeeId: pmr.id,
                            employeeId: prepare.id,
                        },
                    });

                    console.log(itemArr);
                    // res.status(200).json({ success: true, data: info });
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
