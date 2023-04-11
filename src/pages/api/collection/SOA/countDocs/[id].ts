import { PrismaClient } from '@prisma/client';
import { getFullISODate, handleUndefined } from 'functions';
import _ from 'lodash';
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
    data: data[] | Object;
};

const year = new Date().getFullYear();
const startOfYear = new Date(year, 0, 1); // January 1st of the current year
const endOfYear = new Date(year + 1, 0, 1); // January 1st of the following year

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    switch (method) {
        case 'GET':
            {
                try {
                    const numberOfDocuments = await prisma.sOA.count({
                        where: {
                            clientInfoId: req.query.id?.toString(),
                            dateIssued: {
                                gte: startOfYear,
                                lt: endOfYear,
                            },
                        },
                    });

                    res.status(200).json({ success: true, data: numberOfDocuments });
                } catch (error) {
                    console.log(error);
                    res.status(403).json({ success: false, data: [] });
                }
            }
            break;
        case 'POST':
            {
                try {
                    const numberOfDocuments = await prisma.sOA.create({
                        data: {
                            dateIssued: getFullISODate(),
                            clientInfoId: handleUndefined(req.query.id?.toString()),
                        },
                    });

                    res.status(200).json({ success: true, data: numberOfDocuments });
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
