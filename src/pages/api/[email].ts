import { PrismaClient, User } from '@prisma/client';
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
    data: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    let items = await prisma.user.findUnique({
                        where: {
                            email: req.query.email?.toString(),
                        },
                        select: { isAdmin: true, employeeInfoId: true, email: true, isActive: true, role: true },
                    });

                    if (items?.employeeInfoId !== null) {
                        items = await prisma.user.findUnique({
                            where: {
                                email: req.query.email?.toString(),
                            },
                            select: {
                                isAdmin: true,
                                employeeInfoId: true,
                                email: true,
                                employeeInfo: true,
                                isActive: true,
                                role: true,
                            },
                        });
                    }

                    res.status(200).json({ success: true, data: items });
                } catch (error) {
                    res.status(403).json({ success: false, data: [] });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: [] });
            break;
    }
}
