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

async function convertDocxBlobToPdf(docxBlob: Blob): Promise<Blob> {
    const docxBuffer = await docxBlob.arrayBuffer();
    const doc = await PDFDocument.load(docxBuffer);

    // Convert the DOCX document to PDF
    const pdfBytes = await doc.save();

    // Create a Blob from the PDF bytes
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    return pdfBlob;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
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
                    const fileName = 'si.docx';
                    const desktopFolderPath = path.join(os.homedir(), 'Desktop/Reports/forms');
                    const savePath = path.join(desktopFolderPath, fileName);

                    const { file } = req.body;
                    const decodedFile = Buffer.from(file, 'base64');
                    const outputPath = savePath;

                    fs.writeFile(outputPath, decodedFile, (error) => {
                        if (error) {
                            console.log('Error while saving the file:', error);
                            res.status(500).send('Internal Server Error');
                        } else {
                            console.log('File saved successfully');
                            res.status(200).send('File Saved');
                        }
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
