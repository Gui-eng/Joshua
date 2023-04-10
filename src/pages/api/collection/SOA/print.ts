import { NextApiRequest, NextApiResponse } from 'next';
import ExcelJS from 'exceljs';
import sharp from 'sharp';
import path from 'path';
import os from 'os';
import fs from 'fs';
import util from 'util';
import { ItemInfo, SalesInvoiceData } from 'types';
import { getPrice, handleUndefined, getDate, formatCurrency, formatDateString } from 'functions';
import { TableCell } from 'semantic-ui-react';
import _ from 'lodash';

interface HeaderData {
    billTo: string;
    accountName: string;
    address: string;
}

const billStyle: Partial<ExcelJS.Style> = {
    border: {
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } },
        top: { style: 'thin', color: { argb: '00000000' } },
    },
};

const tableStyle: Partial<ExcelJS.Style> = {
    font: {
        size: 9,
    },
    border: {
        bottom: { style: 'thin', color: { argb: '00000000' } },
        left: { style: 'thin', color: { argb: '00000000' } },
        right: { style: 'thin', color: { argb: '00000000' } },
        top: { style: 'thin', color: { argb: '00000000' } },
    },
};

const headerStyle: Partial<ExcelJS.Style> = {
    fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '000000' },
    },
    alignment: {
        horizontal: 'center',
        wrapText: true,
    },
    font: {
        size: 8,
        bold: true,
        color: { argb: 'FFFFFF' },
    },
};

const documentHeader = (worksheet: ExcelJS.Worksheet, workbook: ExcelJS.Workbook, imageBuffer: Buffer) => {
    //Header
    const LOGO = workbook.addImage({
        buffer: imageBuffer,
        extension: 'jpeg',
    });

    worksheet.addImage(LOGO, 'A1:C3');
    worksheet.mergeCells('D1:G1');
    const D1 = worksheet.getCell('D1');
    D1.value = 'United Pharama plus (Unipharma) Inc.';
    D1.style.font = {
        bold: true,
    };

    worksheet.mergeCells('D2:H2');
    worksheet.getCell('D2').value = '1420 3F G. Masangkay St., Sta. Cruz, Manila';

    worksheet.mergeCells('D3:E3');
    worksheet.getCell('D3').value = 'Tel : 8354-27-25';

    worksheet.mergeCells('I1:K3');
    const SOATitle = worksheet.getCell('I1');

    SOATitle.value = 'Statement of Account';
    SOATitle.style = {
        font: { bold: true, size: 14 },
        alignment: {
            horizontal: 'center',
            vertical: 'middle',
        },
    };
};

interface BillData {
    title: string;
    amount: string;
}

function generateBills(worksheet: ExcelJS.Worksheet, billData: BillData[]) {
    const billStyle: Partial<ExcelJS.Style> = {
        font: { bold: true },
        border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        },
    };

    const C13 = worksheet.getCell('C13');
    C13.style = {
        ...billStyle,
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '000000' },
        },
    };

    worksheet.mergeCells('A13:B13');
    worksheet.mergeCells('C13:E13');

    for (let i = 0; i < billData.length; i++) {
        const index = i + 14;
        const bill = billData[i];

        worksheet.getCell(`A${index}`).value = bill.title;
        worksheet.getCell(`A${index}`).style = billStyle;
        worksheet.mergeCells(`A${index}:B${index}`);

        worksheet.getCell(`C${index}`).value = '-₱';
        worksheet.getCell(`C${index}`).style = billStyle;

        worksheet.getCell(`D${index}`).value = bill.amount;
        worksheet.getCell(`D${index}`).style = {
            ...billStyle,
            alignment: { horizontal: 'right' },
        };
        worksheet.mergeCells(`D${index}:E${index}`);
    }
}

function setupHeader(worksheet: ExcelJS.Worksheet, billStyle: Partial<ExcelJS.Style>, headerValues: Array<any>): void {
    const headerStyles: Partial<ExcelJS.Style>[][] = [
        [{ ...billStyle }, { ...billStyle, alignment: { horizontal: 'right' } }],
        [
            { ...billStyle, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } } },
            {
                ...billStyle,
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } },
                alignment: { horizontal: 'right' },
            },
        ],
        [{ ...billStyle }, { ...billStyle, alignment: { horizontal: 'right' } }],
    ];

    for (let i = 0; i < headerValues.length; i++) {
        const [leftValue, rightValue] = headerValues[i];
        const [leftStyle, rightStyle] = headerStyles[i];

        const leftCell = worksheet.getCell(`H${i + 7}`);
        leftCell.value = leftValue;
        leftCell.style = leftStyle;

        const rightCell = worksheet.getCell(`J${i + 7}`);
        rightCell.value = rightValue;
        rightCell.style = rightStyle;

        worksheet.mergeCells(`H${i + 7}:I${i + 7}`);
        worksheet.mergeCells(`J${i + 7}:K${i + 7}`);
    }
}

function createBillToSection(worksheet: ExcelJS.Worksheet, headerData: HeaderData) {
    const A7 = worksheet.getCell('A7');
    A7.value = 'Bill To:';
    A7.style = {
        font: {
            bold: true,
            color: { argb: 'FFFFFF' },
        },
        fill: {
            pattern: 'solid',
            type: 'pattern',
            fgColor: { argb: '000000' },
        },
    };

    const C7 = worksheet.getCell('C7');
    C7.style = {
        font: {
            bold: true,
            color: { argb: 'FFFFFF' },
        },
        fill: {
            pattern: 'solid',
            type: 'pattern',
            fgColor: { argb: '000000' },
        },
    };

    const A8 = worksheet.getCell('A8');
    A8.value = 'Account Name:';
    A8.style = billStyle;

    const C8 = worksheet.getCell('C8');
    C8.value = headerData.accountName;
    C8.style = {
        ...billStyle,
        font: {
            bold: true,
        },
    };

    const A9 = worksheet.getCell('A9');
    A9.value = 'Address:';
    A9.style = billStyle;

    const C9 = worksheet.getCell('C9');
    C9.value = headerData.address;
    C9.style = {
        ...billStyle,
        font: {
            bold: true,
        },
        alignment: {
            vertical: 'middle',
            wrapText: true,
        },
    };

    worksheet.mergeCells('A9:B10');
    worksheet.mergeCells('C9:F10');
    worksheet.mergeCells('C8:F8');
    worksheet.mergeCells('A8:B8');
    worksheet.mergeCells('C7:F7');
    worksheet.mergeCells('A7:B7');
}

function dataFill(worksheet: ExcelJS.Worksheet, startingRow: number, data: any[]) {
    //SOA Bill Tittles
    const SOAHeaderTitles = [
        'SI/DR No.',
        'SI/DR date',
        'Amount',
        'Due Date',
        'Amount Paid',
        'CR/AR No.',
        'Description',
        'Amount Outstanding',
    ];

    const B19 = worksheet.getCell(`B${startingRow}`);
    B19.value = SOAHeaderTitles[0];
    B19.style = headerStyle;
    worksheet.mergeCells(`B${startingRow}:B${startingRow}`);

    const C19 = worksheet.getCell(`C${startingRow}`);
    C19.value = SOAHeaderTitles[1];
    C19.style = headerStyle;
    worksheet.mergeCells(`C${startingRow}:C${startingRow}`);

    const D19 = worksheet.getCell(`D${startingRow}`);
    D19.value = SOAHeaderTitles[2];
    D19.style = headerStyle;
    worksheet.mergeCells(`D${startingRow}:D${startingRow}`);

    const E19 = worksheet.getCell(`E${startingRow}`);
    E19.value = SOAHeaderTitles[3];
    E19.style = headerStyle;
    worksheet.mergeCells(`E${startingRow}:E${startingRow}`);

    const F19 = worksheet.getCell(`F${startingRow}`);
    F19.value = SOAHeaderTitles[4];
    F19.style = headerStyle;
    worksheet.mergeCells(`F${startingRow}:F${startingRow}`);

    const G19 = worksheet.getCell(`G${startingRow}`);
    G19.value = SOAHeaderTitles[5];
    G19.style = headerStyle;
    worksheet.mergeCells(`G${startingRow}:H${startingRow}`);

    const I19 = worksheet.getCell(`I${startingRow}`);
    I19.value = SOAHeaderTitles[6];
    I19.style = headerStyle;
    worksheet.mergeCells(`I${startingRow}:I${startingRow}`);

    const J19 = worksheet.getCell(`J${startingRow}`);
    J19.value = SOAHeaderTitles[7];
    J19.style = headerStyle;
    worksheet.mergeCells(`J${startingRow}:J${startingRow}`);

    //SOA Data
    let dataStartingRow = startingRow + 1;
    data.map((item: any, index: number) => {
        const {
            amount,
            amountDue,
            amountPaid,
            balance,
            checkNumber,
            dateIssued,
            dueDate,
            id,
            siOrDrId,
            siOrDrNo,
            status,
        } = item;

        const num = worksheet.getCell(`B:${dataStartingRow + index}`);
        num.value = siOrDrNo;
        num.style = tableStyle;

        const date = worksheet.getCell(`C:${dataStartingRow + index}`);
        date.value = formatDateString(dateIssued);
        date.style = tableStyle;

        const invoiceAmount = worksheet.getCell(`D:${dataStartingRow + index}`);
        invoiceAmount.value = formatCurrency(amount.toString());
        invoiceAmount.style = tableStyle;

        const dueDateTable = worksheet.getCell(`E:${dataStartingRow + index}`);
        dueDateTable.value = formatDateString(dueDate);
        dueDateTable.style = tableStyle;

        const amountPaidTable = worksheet.getCell(`F:${dataStartingRow + index}`);
        amountPaidTable.value = formatCurrency(amountPaid);
        amountPaidTable.style = tableStyle;

        const checkNumbers = worksheet.getCell(`G:${dataStartingRow + index}`);
        checkNumbers.value = checkNumber;
        checkNumbers.style = tableStyle;
        worksheet.mergeCells(`G${dataStartingRow + index}:H${dataStartingRow + index}`);

        const description = worksheet.getCell(`I:${dataStartingRow + index}`);
        description.value = status;
        description.style = tableStyle;

        const amountOutStanding = worksheet.getCell(`J:${dataStartingRow + index}`);
        amountOutStanding.value =
            balance > 0 ? formatCurrency(balance.toString()) : formatCurrency(amountDue.toString());
        amountOutStanding.style = tableStyle;
    });

    const totalFill = worksheet.getCell(`B${dataStartingRow + data.length}`);
    totalFill.style = {
        ...billStyle,
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D3D3D3' },
        },
    };

    worksheet.mergeCells(`B${dataStartingRow + data.length}:H${dataStartingRow + data.length}`);

    const totalTitle = worksheet.getCell(`I${dataStartingRow + data.length}`);
    totalTitle.style = {
        ...billStyle,
        font: {
            color: { argb: '0000000' },
            bold: true,
            size: 8,
            underline: true,
        },
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D3D3D3' },
        },
    };
    totalTitle.value = 'Amount Due';

    const total = worksheet.getCell(`J${dataStartingRow + data.length}`);
    total.style = {
        ...billStyle,
        font: {
            color: { argb: '0000000' },
            bold: true,
            size: 9,
        },
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D3D3D3' },
        },
    };
    total.value = formatCurrency(_.sumBy(data, 'amountDue').toString());
}

type ObjectWithYears = {
    [year: string]: { [key: string]: any }[];
};

function removeObjectWithYear(obj: ObjectWithYears, yearToRemove: string) {
    const newObj: any = {};

    for (const [year, data] of Object.entries(obj)) {
        if (year !== yearToRemove) {
            newObj[year] = data.map(({ year, ...rest }) => rest);
        }
    }

    return newObj;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

    const { data, to, from, currentDate } = req.body;
    switch (method) {
        case 'POST':
            {
                const writeFile = util.promisify(fs.writeFile);
                try {
                    const dataByYear: { [key: number]: any[] } = {};

                    for (const item of data) {
                        const year = new Date(item.dateIssued).getFullYear();
                        if (!dataByYear[year]) {
                            dataByYear[year] = [];
                        }
                        dataByYear[year].push(item);
                    }

                    const currentYear = new Date(getDate()).getFullYear();
                    const withoutCurrentYearArray: any =
                        Object.values(Object.values(removeObjectWithYear(dataByYear, currentYear.toString()))).length >
                        0
                            ? Object.values(
                                  Object.values(removeObjectWithYear(dataByYear, currentYear.toString())),
                              ).flat()
                            : Object.values(Object.values(removeObjectWithYear(dataByYear, currentYear.toString())))[0];

                    const getSumCurrentYear = _.sumBy(dataByYear[currentYear], 'amountDue');
                    const getSumWithouthCurrentYear = _.sumBy(withoutCurrentYearArray, 'amountDue');

                    console.log(withoutCurrentYearArray);

                    let startingRow = 20;

                    const generateExcel = async (): Promise<ExcelJS.Buffer> => {
                        const workbook = new ExcelJS.Workbook();
                        const worksheet = workbook.addWorksheet('SOA');

                        //Page Setup
                        worksheet.pageSetup.paperSize = 9; // set paper size to A4
                        worksheet.pageSetup.margins = {
                            left: 0.7,
                            right: 0.7,
                            top: 0.75,
                            bottom: 0.75,
                            header: 0.3,
                            footer: 0.3,
                        }; // set margins in inches
                        worksheet.pageSetup.fitToPage = true;

                        const imagePath = path.join(process.cwd(), 'public', 'logo.jpeg');
                        const imageBuffer = await sharp(imagePath).resize({ width: 300 }).toBuffer();

                        documentHeader(worksheet, workbook, imageBuffer);

                        //Billings
                        const createBillData: HeaderData = {
                            accountName: req.body.companyName,
                            address: req.body.address,
                            billTo: req.body.companyName,
                        };
                        createBillToSection(worksheet, createBillData);

                        //Date and Page Details
                        const headerValues = [
                            ['Date', formatDateString(getDate())],
                            ['Statement No.', '1 s.2023'],
                            ['Page No.', '1 of 1'],
                        ];
                        setupHeader(worksheet, billStyle, headerValues);

                        //Bill Details
                        const A13 = worksheet.getCell('A13');
                        A13.value = 'Account Summary';
                        A13.style = {
                            ...billStyle,
                            fill: {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: '000000' },
                            },
                            font: {
                                color: { argb: 'FFFFFF' },
                                bold: true,
                            },
                        };

                        const billData: BillData[] = [
                            {
                                title: 'Previous Balance: ',
                                amount: formatCurrency(getSumWithouthCurrentYear.toString()),
                            },
                            { title: 'New Credits: ', amount: formatCurrency(getSumCurrentYear.toString()) },
                            { title: 'Pull Out: ', amount: '-' },
                            {
                                title: 'Total Balance Due: ',
                                amount: req.body.totalAmountDue,
                            },
                        ];

                        generateBills(worksheet, billData);

                        const objectData = Object.values(dataByYear).map((item) => {
                            dataFill(worksheet, startingRow, item);
                            startingRow = startingRow + item.length + 3;
                        });

                        const buffer = await workbook.xlsx.writeBuffer();

                        return buffer;
                    };

                    const buffer = await generateExcel();
                    const fileName = `SOA.xlsx`;

                    const buff = Buffer.from(buffer);

                    // Save the file to the desktop
                    const desktopFolderPath = path.join(os.homedir(), 'Desktop/Reports');
                    const filePath = path.join(desktopFolderPath, fileName);
                    await writeFile(filePath, buff);

                    res.status(200).json({ data: true });
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
