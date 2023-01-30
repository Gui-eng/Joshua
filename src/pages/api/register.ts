import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface EmployeeInfo {
    firstName: string;
    middleInitial: string;
    lastName: string;
    idNumber: string;
    user: {
        create: {
            email: string;
            role: string | number | boolean | (string | number | boolean)[] | undefined;
            username: string;
            password: string;
        };
    };
}

type Data = {
    success: Boolean;
    data: Object;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'POST':
            {
                try {
                    const data = {
                        ...req.body,
                        user: {
                            create: {
                                ...req.body.user.create,
                                password: await bcrypt.hash(req.body.user.create.password, 10),
                            },
                        },
                    };
                    const items = await prisma.employeeInfo.create({ data: data });
                    res.status(200).json({ success: true, data: {} });
                } catch (error) {
                    res.status(403).json({ success: false, data: {} });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: [] });
            break;
    }
}
