import { NextApiRequest, NextApiResponse } from 'next';
import ExcelJS from 'exceljs';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { ItemInfo, SalesInvoiceData } from 'types';
import { getPrice, handleUndefined, getDate } from 'functions';
import { TableCell } from 'semantic-ui-react';
import NextCors from 'nextjs-cors';

const tableHeaders = [
    'SI No. / DR No.',
    'Date Issued',
    'Customer Name',
    'Item Description',
    'Quantity',
    'S-Price',
    'Net Discount',
    'Vatable Sales',
    'Non-VAT Sales',
    'VATAmount',
    'Gross Sales',
    'Discount',
    'PMR Code',
    'TIN',
];

function setupTitle(worksheet: ExcelJS.Worksheet, title: string, row: number, size: number) {
    worksheet.addRow([title]);
    worksheet.addRow(['']);

    worksheet.mergeCells(`A${row}:N${row + 1}`);

    const titleCell = worksheet.getCell(`A${row}:N${row + 1}`);

    worksheet.getRow(row).eachCell((cell) => {
        titleCell.style = {
            alignment: {
                vertical: 'middle',
            },

            font: {
                bold: true,
                size: size,
                color: { argb: 'FFFFF5' },
            },
        };

        cell.border = {
            top: { style: 'thin', color: { argb: '00000000' } },
            left: { style: 'thin', color: { argb: '00000000' } },
            bottom: { style: 'thin', color: { argb: '00000000' } },
            right: { style: 'thin', color: { argb: '00000000' } },
        };
    });

    titleCell.border = {
        top: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        bottom: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } },
    };

    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1520A6' },
    };
}

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
                        const workbook = new ExcelJS.Workbook();
                        const worksheet = workbook.addWorksheet('Sales Report');
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

                        //Title Setup

                        setupTitle(worksheet, 'Uni-Pharma Plus Inc.', 1, 14);
                        setupTitle(worksheet, 'Sales Report Summary (All Invoice/DR)', 3, 12);

                        const dateRow = worksheet.addRow([
                            'From :',
                            from.substring(10, 0),
                            '',
                            '',
                            'To : ',
                            to.substring(10, 0),
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                        ]);
                        worksheet.getRow(5).eachCell((cell) => {
                            if (cell.value !== '') {
                                cell.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: '77B5FE' },
                                };

                                cell.font = {
                                    color: { argb: 'FFFFFF5' },
                                    bold: true,
                                };
                            } else {
                                cell.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: { argb: '1520A6' },
                                };
                            }
                        });
                        //Table Header Setup

                        worksheet.addRow(tableHeaders);

                        worksheet.getRow(6).eachCell((cell) => {
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: '77B5FE' },
                            };
                            cell.font = {
                                color: { argb: 'FFFFFFFF' },
                                bold: true,
                            };

                            const color = '00000000';

                            cell.border = {
                                top: { style: 'thin', color: { argb: color } },
                                left: { style: 'thin', color: { argb: color } },
                                bottom: { style: 'thin', color: { argb: color } },
                                right: { style: 'thin', color: { argb: color } },
                            };
                        });

                        const arr = data.map((sales: any) => {
                            const items = sales.items.map((item: any) => {
                                function limit(data: any) {
                                    return parseFloat(parseFloat(data).toFixed(2));
                                }
                                const row = worksheet.addRow([
                                    sales.salesInvoiceNumber !== undefined
                                        ? sales.salesInvoiceNumber
                                        : sales.deliveryReciptNumber,
                                    sales.dateIssued.substring(10, 0),
                                    sales.client?.clientInfo.companyName,
                                    item.ItemInfo?.itemName,
                                    item.quantity,
                                    limit(getPrice(item.ItemInfo.ItemPrice[0], item.unit)?.toString()),
                                    limit(item.ItemSalesDetails[0].netAmount),
                                    item.vatable ? limit(item.ItemSalesDetails[0].netAmount) : '-',
                                    !item.vatable ? limit(item.ItemSalesDetails[0].netAmount) : '-',
                                    limit(item.ItemSalesDetails[0].VATAmount),
                                    limit(item.ItemSalesDetails[0].grossAmount),
                                    limit((handleUndefined(item.discount) * 100).toString()) + '%',
                                    sales.pmr?.employeeInfo.code,
                                    sales.client?.clientInfo.TIN,
                                ]);

                                row.eachCell((cell) => {
                                    const color = '00008B';
                                    cell.border = {
                                        top: { style: 'thin', color: { argb: color } },
                                        left: { style: 'thin', color: { argb: color } },
                                        bottom: { style: 'thin', color: { argb: color } },
                                        right: { style: 'thin', color: { argb: color } },
                                    };

                                    cell.font = {
                                        size: 10,
                                    };
                                });
                            });
                        });

                        for (let index = 7; index <= worksheet.rowCount; index++) {
                            worksheet.getRow(index).alignment = { horizontal: 'left' };
                        }

                        for (let i = 1; i <= worksheet.columnCount; i++) {
                            let longestText = 0;
                            for (let j = 5; j <= worksheet.rowCount; j++) {
                                const cell = handleUndefined(worksheet.getRow(j).getCell(i).value?.toString().length);
                                if (cell > longestText) {
                                    longestText = cell;
                                }
                            }
                            worksheet.getColumn(i).width = longestText + 2;
                        }

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
                    const desktopFolderPath = path.join(os.homedir(), 'Desktop/Reports/Sales');
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
