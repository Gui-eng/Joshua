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
                        const filePath = path.join(process.cwd(), 'public', 'newsi.xlsx');

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

                        const C9 = worksheet.getCell('C7');
                        C9.value = req.body.client.clientInfo.companyName;
                        C9.style = style;
                        // worksheet.mergeCells('C9:G9');

                        const C10 = worksheet.getCell('F9');
                        C10.value = req.body.client.clientInfo.TIN;
                        C10.style = style;

                        const C11 = worksheet.getCell('C8');
                        C11.value = req.body.client.clientInfo.address;
                        C11.style = style;
                        // worksheet.mergeCells('C10:G10');

                        const G9 = worksheet.getCell('F7');
                        G9.value = formatDateString(req.body.dateIssued);
                        G9.style = style;
                        // worksheet.mergeCells('H9:I9');

                        const G10 = worksheet.getCell('F8');
                        G10.value = req.body.term;
                        G10.style = {
                            ...style,
                            alignment: {
                                horizontal: 'left',
                            },
                        };
                        // worksheet.mergeCells('C10:G10');

                        const { items } = req.body;
                        const hasVatExempt = items.some((item: any) => {
                            if (!item.ItemInfo.VAT) {
                                return true;
                            }
                            return false;
                        });

                        // console.log(formatCurrency(_.sumBy(items, (item: any) => item.totalAmount).toString()));
                        let startingCell = 11;

                        items.map((item: any) => {
                            const B = worksheet.getCell(`B${startingCell}`);
                            B.value = item.quantity;
                            B.style = {
                                ...style,
                                alignment: {
                                    horizontal: 'center',
                                },
                            };

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

                            console.log(getPrice(item.ItemInfo.ItemPrice[0], item.unit));
                            const unitPrice = worksheet.getCell(`F${startingCell}`);
                            unitPrice.value = getPrice(item.ItemInfo.ItemPrice[0], item.unit) + '     '+  (item.discount * 100).toString() + '%';
                            unitPrice.style = {
                                ...style,
                                alignment: {
                                    horizontal: 'center',
                                },
                            };

                            

                            const totalAmount = worksheet.getCell(`G${startingCell}`);
                            totalAmount.value = formatCurrency(item.totalAmount);
                            totalAmount.style = style;

                            startingCell = startingCell + 4;
                        });
                        const footer = worksheet.getCell(`C${startingCell}`);
                        footer.value = '************NOTHING FOLLOWS************';
                        footer.style = style;

                        const remarks = worksheet.getCell(`C${startingCell + 1}`);
                        remarks.value = 'Remarks: ' + req.body.remarks;
                        remarks.style = style;

                        if (hasVatExempt) {
                            const vatSales = worksheet.getCell('E29');
                            vatSales.value = formatCurrency(
                                _.sumBy(
                                    items.filter((item: any) => item.vatable),
                                    (item: any) => Number(item.totalAmount),
                                ).toString(),
                            );
                            vatSales.style = style;
                            const nonVat = worksheet.getCell('E30');
                            nonVat.value = formatCurrency(
                                _.sumBy(
                                    items.filter((item: any) => !item.vatable),
                                    (item: any) => Number(item.totalAmount),
                                ).toString(),
                            );
                            nonVat.style = style;

                            const VATAmount = worksheet.getCell('E32');
                            VATAmount.value = formatCurrency(req.body.TotalDetails.VATAmount);
                            VATAmount.style = style;

                            const amountTotal = worksheet.getCell('G35');
                            amountTotal.value = formatCurrency(req.body.totalAmount);
                            amountTotal.style = style;

                            const amountDue = worksheet.getCell('G33');
                            amountDue.value = formatCurrency(req.body.totalAmount);
                            amountDue.style = style;
                        } else {
                            const amountTotal = worksheet.getCell('G29');
                            amountTotal.value = formatCurrency(req.body.totalAmount);
                            amountTotal.style = style;

                            const lessVATAmount = worksheet.getCell('G30');
                            lessVATAmount.value = formatCurrency(req.body.TotalDetails.VATAmount);
                            lessVATAmount.style = style;

                            const netVATAmount = worksheet.getCell('G31');
                            netVATAmount.value = formatCurrency(
                                (Number(req.body.totalAmount) - Number(req.body.TotalDetails.VATAmount)).toString(),
                            );
                            netVATAmount.style = style;

                            const amountDue = worksheet.getCell('G33');
                            amountDue.value = formatCurrency(req.body.totalAmount);
                            amountDue.style = style;

                            const addVATAmount = worksheet.getCell('G30');
                            addVATAmount.value = formatCurrency(req.body.TotalDetails.VATAmount);
                            addVATAmount.style = style;

                            const totalAmountDue = worksheet.getCell('G35');
                            totalAmountDue.value = formatCurrency(req.body.totalAmount);
                            totalAmountDue.style = style;
                        }

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
