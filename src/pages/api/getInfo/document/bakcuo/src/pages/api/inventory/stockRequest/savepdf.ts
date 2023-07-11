import path from 'path';
import os, { type } from 'os';
import fs from 'fs';
import NextCors from 'nextjs-cors';
import { NextApiRequest, NextApiResponse } from 'next';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { convertWordFiles } from 'convert-multiple-files-ul';
import formidable from 'formidable';

import { Blob } from 'buffer';
import { PDFDocument } from 'pdf-lib';
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
                    const fileName = 'stockRequest.docx';
                    const desktopFolderPath = path.join(os.homedir(), 'Desktop/Reports/forms');
                    const savePath = path.join(desktopFolderPath, fileName);

                    await convertWordFiles(savePath, 'pdf', desktopFolderPath, '3');

                    const publicPath = path.join(process.cwd(), 'public');
                    const filePath = path.join(publicPath);

                    await convertWordFiles(savePath, 'pdf', filePath, '3');

                    res.status(200).json({ success: true });
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
