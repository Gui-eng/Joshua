import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
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

type Data = {
    success: Boolean;
    data: data[] | Object;
};

enum DEPARTMENT {
    SALES = 'SALES',
    PMR = 'PMR',
    INVENTORY = 'INVENTORY',
    ACCOUNTING = 'ACCOUNTING',
    IT = 'IT',
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
                    const info = await prisma.employeeInfo.findMany({
                        where: {
                            department: DEPARTMENT.PMR,
                        },
                    });

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
