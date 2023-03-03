import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

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

enum DEPARTMENT {
    SALES = 'SALES',
    PMR = 'PMR',
    INVENTORY = 'INVENTORY',
    ACCOUNTING = 'ACCOUNTING',
    IT = 'IT',
}

type Data = {
    success: Boolean;
    data: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    const info = await prisma.employeeInfo.findUnique({
                        where: {
                            id: req.query.id?.toString(),
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
