import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { useSession } from 'next-auth/react';

const prisma = new PrismaClient();

interface data {
    firstName: String;
    middleName: String;
    lastName: String;
    code: String;
    address: String;
    dateHired: String;
    department: String;
    contactNo: String;
}

type Data = {
    success: Boolean;
    data: data[] | Object;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;

    switch (method) {
        case 'GET':
            {
                try {
                    const info = await prisma.employeeInfo.findMany();
                    res.status(200).json({ success: true, data: info });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [] });
                }
            }
            break;
        case 'POST':
            {
                const { firstName, middleName, lastName, code, address, dateHired, department, contactNo, email } =
                    req.body;
                console.log(email);
                try {
                    const info = await prisma.employeeInfo.create({
                        data: {
                            firstName: firstName,
                            middleName: middleName,
                            lastName: lastName,
                            code: code,
                            address: address,
                            dateHired: dateHired,
                            department: department,
                            contactNo: contactNo,
                        },
                    });
                    const usr = await prisma.user.findUnique({
                        where: {
                            email: email,
                        },
                    });

                    if (usr?.employeeInfoId === null) {
                        const inf = await prisma.user.update({
                            where: { email: email },
                            data: {
                                employeeInfoId: info.id,
                            },
                        });
                    }

                    const getItems = await prisma.itemInfo.findMany();

                    getItems.map(async (items: any) => {
                        try {
                            const stocks = await prisma.stocks.create({
                                data: {
                                    pmrEmployeeId: info.id,
                                    itemInfoId: items.id,
                                },
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    });

                    res.status(200).json({ success: true, data: req.body });
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
