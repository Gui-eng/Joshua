import { NextApiRequest, NextApiResponse } from 'next';
import ExcelJS, { PageSetup } from 'exceljs';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { ItemInfo, SalesInvoiceData } from 'types';
import { getPrice, handleUndefined, getDate, formatDateString, quantityOptions } from 'functions';
import { TableCell } from 'semantic-ui-react';
import NextCors from 'nextjs-cors';

const style: Partial<ExcelJS.Style> = {
    font: {
        bold: true,
        size: 9,
    },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
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
                    const generateExcel = async (): Promise<ExcelJS.Buffer> => {
                        const filePath = path.join(process.cwd(), 'public', 'old.xlsx');

                        const workbook = new ExcelJS.Workbook();
                        await workbook.xlsx.readFile(filePath);

                        const worksheet = workbook.getWorksheet('DR OLD');
                        //Page Setup

                        worksheet.pageSetup.paperSize = undefined; // 9 is the code for custom size

                        worksheet.pageSetup.margins = {
                            left: 0.0,
                            right: 0.0,
                            top: 0.0,
                            bottom: 0.0,
                            header: 0.0,
                            footer: 0.0,
                        }; // set margins in inches

                        const C9 = worksheet.getCell('C9');
                        C9.value = req.body.client.clientInfo.companyName;
                        C9.style = style;
                        // worksheet.mergeCells('C9:G9');

                        const C10 = worksheet.getCell('C10');
                        C10.value = req.body.client.clientInfo.address;
                        C10.style = style;
                        // worksheet.mergeCells('C10:G10');

                        const H9 = worksheet.getCell('H9');
                        H9.value = formatDateString(req.body.dateIssued);
                        H9.style = style;
                        // worksheet.mergeCells('H9:I9');

                        const H10 = worksheet.getCell('I10');
                        H10.value = req.body.term;
                        H10.style = style;
                        // worksheet.mergeCells('C10:G10');

                        const { items } = req.body;
                        let startingCell = 13;

                        items.map((item: any) => {
                            const B = worksheet.getCell(`B${startingCell}`);
                            B.value = item.quantity;
                            B.style = style;

                            const C = worksheet.getCell(`C${startingCell}`);
                            C.value = item.unit;
                            C.style = style;

                            const D = worksheet.getCell(`D${startingCell}`);
                            D.value = item.ItemInfo.itemName;
                            D.style = style;

                            const D1 = worksheet.getCell(`D${startingCell + 1}`);
                            D1.value = 'LOT/ BATCH NO.: ' + item.ItemInfo.batchNumber;
                            D1.style = style;

                            const D2 = worksheet.getCell(`D${startingCell + 2}`);
                            D2.value = 'MFG DATE: ' + formatDateString(item.ItemInfo.manufacturingDate);
                            D2.style = style;

                            const D3 = worksheet.getCell(`D${startingCell + 3}`);
                            D3.value = 'EXP DATE: ' + formatDateString(item.ItemInfo.expirationDate);
                            D3.style = style;

                            startingCell = startingCell + 4;
                        });
                        const footer = worksheet.getCell(`C${startingCell}`);
                        footer.value = '************NOTHING FOLLOWS************';
                        footer.style = style;

                        const remarks = worksheet.getCell(`C${startingCell + 1}`);
                        remarks.value = req.body.remarks;
                        remarks.style = style;

                        const I35 = worksheet.getCell('I35');
                        I35.value = req.body.totalAmount;
                        I35.style = style;

                        const H36 = worksheet.getCell('H36');
                        H36.value =
                            req.body.preparedBy.employeeInfo.firstName +
                            ' ' +
                            req.body.preparedBy.employeeInfo.lastName;
                        H36.style = style;

                        const buffer = await workbook.xlsx.writeBuffer();

                        return buffer;
                    };

                    const buffer = await generateExcel();
                    const fileName = `test.xlsx`;

                    const buff = Buffer.from(buffer);

                    // Save the file to the desktop
                    const desktopFolderPath = path.join(os.homedir(), 'Desktop/Reports/');
                    const filePath = path.join(desktopFolderPath, fileName);
                    fs.writeFile(filePath, buff, (err) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            res.status(200).json({ data: req.body });
                        }
                    });
                } catch (error) {
                    console.error(error);
                    res.status(500).send('Internal Server Error');
                }
            }
            break;
        default:
            res.status(500).send('Internal Server Error');
            break;
    }
};
