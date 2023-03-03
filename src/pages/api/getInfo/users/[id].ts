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
                    const info = await prisma.user.findUnique({
                        where: { id: req.query.toString() },
                        select: { isAdmin: true },
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
