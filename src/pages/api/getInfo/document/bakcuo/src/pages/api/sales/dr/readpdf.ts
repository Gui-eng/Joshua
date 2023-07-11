import path from 'path';
import os, { type } from 'os';
import fs from 'fs';
import NextCors from 'nextjs-cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { print } from 'pdf-to-printer';
import printJS from 'print-js';
import { isBuffer } from 'lodash';

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
                    const fileName = 'dr.docx';
                    const desktopFolderPath = path.join(os.homedir(), 'Desktop/Reports/forms');
                    const savePath = path.join(desktopFolderPath, fileName);

                    fs.readFile(savePath, (err, data) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({ error: 'Error reading file' });
                            return;
                        }

                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', 'attachment; filename="file.pdf"');
                        res.send(data);
                    });
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
