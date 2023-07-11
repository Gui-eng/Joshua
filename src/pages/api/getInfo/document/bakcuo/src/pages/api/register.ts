import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import NextCors from 'nextjs-cors';

const prisma = new PrismaClient();

type Data = {
    success: Boolean;
    data: Object;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await NextCors(req, res, {
        // Options
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });
    const { method } = req;
    switch (method) {
        case 'POST':
            {
                try {
                    const { password } = req.body;
                    console.log(req.body);
                    const data = { ...req.body, password: await bcrypt.hash(password, 10) };
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
