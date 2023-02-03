import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
                    const data = { ...req.body, password: await bcrypt.hash(req.body.password, 10) };
                    const items = await prisma.user.create({ data: data });

                    res.status(200).json({ success: true, data: {} });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: {} });
                }
            }
            break;
        default:
            res.status(403).json({ success: false, data: [] });
            break;
    }
}
