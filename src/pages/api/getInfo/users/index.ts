import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { useSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const { method } = req;

    switch (method) {
        case 'GET':
            {
                try {
                    const info = await prisma.user.findMany({
                        select: { employeeInfo: true, isActive: true, username: true, email: true },
                    });
                    res.status(200).json(info);
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
