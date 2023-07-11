import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { useSession } from 'next-auth/react';
import NextCors from 'nextjs-cors';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
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
                    const info = await prisma.employeeInfo.findUnique({
                        where: { id: req.query.id?.toString() },
                    });
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
                try {
                    const info = await prisma.employeeInfo.update({
                        where: { id: req.query.id?.toString() },
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
