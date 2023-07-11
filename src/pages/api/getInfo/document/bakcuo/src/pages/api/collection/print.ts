import { NextApiRequest, NextApiResponse } from 'next';
import ExcelJS from 'exceljs';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { ItemInfo, SalesInvoiceData } from 'types';
import { getPrice, handleUndefined, getDate, limit } from 'functions';
import { TableCell } from 'semantic-ui-react';
import NextCors from 'nextjs-cors';

const billStyle: Partial<ExcelJS.Style> = {
    border: {
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } },
        top: { style: 'thin', color: { argb: '00000000' } },
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

    const { data, to, from, currentDate } = req.body;
    
    switch (method) {
        case 'POST':
            {
                try {
                    const generateExcel = async (): Promise<ExcelJS.Buffer> => {
                        const filePath = path.join(process.cwd(), 'public', 'collection.xlsx');

                        const workbook = new ExcelJS.Workbook();
                        await workbook.xlsx.readFile(filePath);
                        const worksheet = workbook.getWorksheet('Collection');
                        //Page Setup

                        worksheet.pageSetup.paperSize = undefined; // set paper size to A4
                        worksheet.pageSetup.margins = {
                            left: 0.7,
                            right: 0.7,
                            top: 0.75,
                            bottom: 0.75,
                            header: 0.3,
                            footer: 0.3,
                        }; // set margins in inches

                        worksheet.getCell('B5').value = from;
                        worksheet.getCell('F5').value = to;

                        let startingCell = 7;
                        data.map((item: any) => {
                            const A = worksheet.getCell(`A${startingCell}`);
                            A.value = item.salesInvoice
                                ? item.salesInvoice.client.clientInfo.companyName
                                : item.deliveryRecipt.client.clientInfo.companyName;
                            A.style = billStyle;

                            const B = worksheet.getCell(`B${startingCell}`);
                            B.value = !item.deliveryReciptId
                                ? item.salesInvoice.salesInvoiceNumber
                                : item.deliveryRecipt.deliveryReciptNumber;
                            B.style = billStyle;

                            const C = worksheet.getCell(`C${startingCell}`);
                            C.value = item.dateIssued.substring(10, 0);
                            C.style = billStyle;

                            const D = worksheet.getCell(`D${startingCell}`);
                            D.value = limit(parseFloat(item.amount));
                            D.style = billStyle;

                            const E = worksheet.getCell(`E${startingCell}`);
                            E.value = item.modeOfPayment;
                            E.style = billStyle;

                            const F = worksheet.getCell(`F${startingCell}`);
                            F.value = item.depositDateAndTime.substring(10, 0);
                            F.style = billStyle;

                            const G = worksheet.getCell(`G${startingCell}`);
                            G.value = item.remarks;
                            G.style = billStyle;

                            const H = worksheet.getCell(`H${startingCell}`);
                            H.value = !item.deliveryReciptId
                                ? item.salesInvoice.pmr.employeeInfo.code
                                : item.deliveryRecipt.pmr.employeeInfo.code;
                            H.style = billStyle;

                            startingCell = startingCell + 1;
                        });

                        //Title Setup
                        worksheet.pageSetup.fitToPage = true;
                        worksheet.pageSetup.fitToHeight = 1;
                        worksheet.pageSetup.orientation = 'landscape';

                        const buffer = await workbook.xlsx.writeBuffer();

                        return buffer;
                    };

                    const buffer = await generateExcel();
                    const fileName = `${from.substring(10, 0)}_to_${to.substring(10, 0)}.xlsx`;

                    const buff = Buffer.from(buffer);

                    // Save the file to the desktop
                    const desktopFolderPath = path.join(os.homedir(), 'Desktop/Reports/Collection');
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
