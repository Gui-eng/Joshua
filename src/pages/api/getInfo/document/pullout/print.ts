import { NextApiRequest, NextApiResponse } from 'next';
import ExcelJS, { PageSetup } from 'exceljs';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { ItemInfo, SalesInvoiceData } from 'types';
import { getPrice, handleUndefined, getDate, formatDateString, quantityOptions, formatCurrency } from 'functions';
import { TableCell } from 'semantic-ui-react';
import NextCors from 'nextjs-cors';
import _, { sumBy } from 'lodash';

const style: Partial<ExcelJS.Style> = {
    font: {
        size: 9,
    },
};

const dataStyle: Partial<ExcelJS.Style> = {
    border: {
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } },
        top: { style: 'thin', color: { argb: '00000000' } },
    },

    font: {
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
                        const filePath = path.join(process.cwd(), 'public', 'pullout.xlsx');

                        const workbook = new ExcelJS.Workbook();
                        await workbook.xlsx.readFile(filePath);

                        const worksheet = workbook.getWorksheet('NEW SI');
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

                        const C9 = worksheet.getCell('C8');
                        C9.value = req.body[0].client.companyName;
                        C9.style = style;
                        // worksheet.mergeCells('C9:G9');

                        const C11 = worksheet.getCell('C9');
                        C11.value = req.body[0].client.address;
                        C11.style = style;
                        // worksheet.mergeCells('C10:G10');

                        const G9 = worksheet.getCell('F8');
                        G9.value = formatDateString(req.body[0].dateIssued);
                        G9.style = style;
                        // worksheet.mergeCells('H9:I9');

                        const G10 = worksheet.getCell('F9');
                        G10.value = req.body[0].status;
                        G10.style = {
                            ...style,
                            alignment: {
                                horizontal: 'left',
                            },
                        };
                        // worksheet.mergeCells('C10:G10');

                        // console.log(formatCurrency(_.sumBy(items, (item: any) => item.totalAmount).toString()));
                        let startingCell = 14;

                        req.body.map((item: any) => {
                            const B = worksheet.getCell(`B${startingCell}`);
                            B.value = item.quantity + ' ' + item.unit;
                            B.style = {
                                ...style,
                                alignment: {
                                    horizontal: 'center',
                                },
                            };

                            const D = worksheet.getCell(`D${startingCell}`);
                            D.value = item.ItemInfo.itemName;
                            D.style = style;

                            const D1 = worksheet.getCell(`D${startingCell + 1}`);
                            D1.value = 'LOT/ BATCH NO.: ' + item.batchNumber;
                            D1.style = style;

                            const D2 = worksheet.getCell(`D${startingCell + 2}`);
                            D2.value = 'MFG DATE: ' + formatDateString(item.manufacturingDate);
                            D2.style = style;

                            const D3 = worksheet.getCell(`D${startingCell + 3}`);
                            D3.value = 'EXP DATE: ' + formatDateString(item.expirationDate);
                            D3.style = style;

                            const totalAmount = worksheet.getCell(`G${startingCell}`);
                            totalAmount.value = formatCurrency(item.totalAmount);
                            totalAmount.style = style;

                            startingCell = startingCell + 4;
                        });

                        const buffer = await workbook.xlsx.writeBuffer();

                        return buffer;
                    };

                    const buffer = await generateExcel();
                    const fileName = `NEWSI.xlsx`;

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
