import { NextRouter, useRouter } from 'next/router';
import { Button, DropdownProps, Header, SemanticCOLORS } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';
import {
    UNITS,
    Item,
    ItemInfo,
    ItemPrice,
    Option,
    SalesInvoiceData,
    ItemSalesComputationData,
    ItemSalesDetails,
    TotalData,
    DeliveryReciptData,
} from 'types';
import { createElement } from 'react';
import { PAYMENT_STATUS } from '@prisma/client';
import axios from 'axios';
import _ from 'lodash';

export const emptyOptions: Option = {
    id: '',
    key: '',
    text: '',
    value: '',
};

export const emptyTotalData = {
    grossAmount: 0.0,
    netAmount: 0.0,
    vatExempt: true,
    VATAmount: 0.0,
    netVATAmount: 0.0,
    VATableSales: 0.0,
    nonVATSales: 0.0,
};

export const emptySalesInvoiceData: SalesInvoiceData = {
    dateIssued: '',
    salesInvoiceNumber: '',
    term: 0,
    totalAmount: 0,
    pmrEmployeeId: '',
    clientId: '',
    VAT: 0,
    remarks: '',
    item: [],
    isRemote: false,
    total: emptyTotalData,
};

export const emptyDeliveryRecipt: DeliveryReciptData = {
    dateIssued: '',
    deliveryReciptNumber: '',
    totalAmount: 0,
    pmrEmployeeId: '',
    clientId: '',
    VAT: 0,
    term: 0,
    remarks: '',
    item: [],
    isRemote: false,
    total: emptyTotalData,
};

export const emptyPrice: ItemPrice = {
    bottle: 0,
    box: 0,
    capsule: 0,
    tablet: 0,
    vial: 0,
    itemInfoId: '',
};

export const emptyItemData: ItemInfo = {
    id: '1',
    batchNumber: '',
    expirationDate: '',
    itemName: '',
    manufacturingDate: '',
    VAT: true,
    price: emptyPrice,
};

export const emptyItemSalesDetails: ItemSalesDetails = {
    itemId: '1',
    grossAmount: 0,
    discount: 0,
    netAmount: 0,
    VATAmount: 0,
    vatable: true,
};

export const emptySalesItemData: Item = {
    id: uuidv4(),
    quantity: 0,
    unit: '',
    discount: 0,
    unitPrice: 0,
    totalAmount: parseFloat('0'),
    ItemInfo: emptyItemData,
    itemSalesDetails: emptyItemSalesDetails,

    vatable: true,
    isPullout: false,
};

export const quantityOptions: Option[] = [
    { id: 'unit', key: UNITS.BOTTLES, text: 'Bottle/s', value: UNITS.BOTTLES },
    { id: 'unit', key: UNITS.BOX, text: 'Box/es', value: UNITS.BOX },
    { id: 'unit', key: UNITS.CAPSULES, text: 'Capsule/s', value: UNITS.CAPSULES },
    { id: 'unit', key: UNITS.TABLETS, text: 'Tablet/s', value: UNITS.TABLETS },
    { id: 'unit', key: UNITS.VIALS, text: 'Vial/s', value: UNITS.VIALS },
];

function deleteFromArrayOptions(arr: Array<any>, value: any) {
    const newArr = arr.filter((item) => item.value !== value);
    return newArr;
}

export function showAvailableUnits(
    data: ItemPrice,
    setAvailableQuantityOption: React.Dispatch<React.SetStateAction<any>>,
) {
    let newArr = quantityOptions;
    Object.entries(data).map((item: any, index: number) => {
        const [key, value] = item;

        switch (key) {
            case 'bottle':
                if (value === '0') {
                    newArr = deleteFromArrayOptions(newArr, 'BOTTLES');
                }
                break;
            case 'vial':
                if (value === '0') {
                    newArr = deleteFromArrayOptions(newArr, 'VIALS');
                }
                break;
            case 'capsule':
                if (value === '0') {
                    newArr = deleteFromArrayOptions(newArr, 'CAPSULES');
                }
                break;
            case 'tablet':
                if (value === '0') {
                    newArr = deleteFromArrayOptions(newArr, 'TABLETS');
                }
                break;
            case 'box':
                if (value === '0') {
                    newArr = deleteFromArrayOptions(newArr, 'BOX');
                }
                break;
            default:
                break;
        }
    });

    setAvailableQuantityOption(newArr);
}

export function handleOnChange(
    e: React.ChangeEvent<HTMLInputElement>,
    data: any,
    setData: React.Dispatch<React.SetStateAction<any>>,
) {
    setData(
        data === undefined
            ? undefined
            : {
                  ...data,
                  [e.target.id]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value,
              },
    );
}

export function handleDateChange(
    e: React.ChangeEvent<HTMLInputElement>,
    data: any,
    setData: React.Dispatch<React.SetStateAction<any>>,
) {
    setData(data === undefined ? undefined : { ...data, [e.target.id]: e.target.value + 'T00:00:00Z' });
}

export function handleDateChangeToBeChecked(
    e: React.ChangeEvent<HTMLInputElement>,
    data: any,
    setData: React.Dispatch<React.SetStateAction<any>>,
) {
    const date = new Date(e.target.value);
    setData(data === undefined ? undefined : { ...data, [e.target.id]: date });
}

export function handleOptionsChange(
    e: React.SyntheticEvent<HTMLElement, Event>,
    item: DropdownProps,
    data: any,
    setData: React.Dispatch<React.SetStateAction<any>>,
) {
    setData(data === undefined ? undefined : { ...data, [e.currentTarget.id]: item.value });
}

export function handleFilteredOptionsChange(
    e: React.SyntheticEvent<HTMLElement, Event>,
    item: DropdownProps,
    data: any,
    setData: React.Dispatch<React.SetStateAction<any>>,
) {
    const newData = data === undefined ? {} : { ...data, [e.currentTarget.id]: item.value };
    setData(newData);
}

export function hasEmptyFields(data: any, exempt?: Array<string>): boolean {
    return Object.entries(data).some(([key, value]) => {
        if (
            (typeof value === 'string' && value === '' && (exempt === undefined ? true : !exempt.includes(key))) ||
            (typeof value === 'number' && value === 0 && (exempt === undefined ? true : !exempt.includes(key)))
        ) {
            return true;
        } else {
            return false;
        }
    });
}

export function find(id: string, array: Array<any>) {
    return array.find((item: any) => {
        return item.id === id;
    });
}

export function findMany(key: string, array: Array<any>, value: string) {
    return array.filter((data: any) => {
        return data[key] === value;
    });
}

interface StringToFloatObject {
    [key: string]: string | number;
}

function convertToFloat(obj: StringToFloatObject): StringToFloatObject {
    const newObj: StringToFloatObject = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            newObj[key] = parseFloat(value);
        } else {
            newObj[key] = value;
        }
    }
    return newObj;
}

/**
 * Converts an array of data into an array of Option objects for use in React components.
 * @param data - The data to convert.
 * @param componentId - The ID of the component for which the options are being generated.
 * @param textElements - An array of strings that represent the properties of the data to be used as text for the options.
 * @param value - An optional string that represents the property of the data to be used as the value for the options.
 * @returns An array of Option objects.
 */
export function makeOptions(
    data: Array<any>,
    componentId: string,
    textElements: Array<string>,
    value?: string,
): Option[] {
    return data.map((item: any) => {
        const texts = textElements
            .map((text: string) => {
                return ' ' + item[text];
            })
            .join('');
        return {
            id: componentId,
            key: item.id,
            value: value !== undefined ? item[value] : item.id,
            text: texts,
        };
    });
}

export function makeOptionsForFilter(
    data: Array<any>,
    componentId: string,
    textElements: Array<string>,
    value?: string,
): Option[] {
    return data.map((item: any) => {
        const texts = textElements
            .map((text: string) => {
                return ' ' + (item[text] !== undefined ? item[text] : '');
            })
            .join('');
        return {
            id: data[0].salesInvoiceNumber !== undefined ? 'salesInvoiceNumber' : 'deliveryReciptNumber',
            key: item.id,
            value: value !== undefined ? item[value] : item.id,
            text: texts,
        };
    });
}

/**
 * Returns the current date in ISO string format, adjusted to the Philippines time zone.
 * @returns A string representation of the current date in ISO format, adjusted to the Philippines time zone.
 */
export function getDate(): string {
    // Create a new Date object using the current time
    const date = new Date(Date.now());

    // Adjust the time zone of the Date object to match the Philippines
    date.setUTCHours(date.getUTCHours() + 8);

    // Convert the date to an ISO string format and return the substring representing the date only
    return date.toISOString().substring(0, 10);
}

/**
 * Removes duplicate objects from an array of objects, based on a specified key.
 * @param data An array of objects.
 * @param key The key to use for determining uniqueness.
 * @returns A new array of objects with duplicates removed.
 */
export function removeDuplicates(data: any, key: string) {
    return data.filter((item: any, index: number, arr: Array<any>) => {
        return (
            index ===
            arr.findIndex((o) => {
                return o[key] === item[key];
            })
        );
    });
}

/**
 * Returns a default value if the input is undefined.
 * @param data The input value to check.
 * @returns The input value if it is defined, or an empty string if it is undefined.
 */
export function handleUndefined(data: any) {
    // Check if the input value is undefined
    if (data !== undefined) {
        // If it is not undefined, return the input value
        return data;
    } else {
        // If it is undefined, return an empty string
        return '';
    }
}

/**
 * Returns the price for a given unit of measurement.
 * @param data The item price object containing prices for different units.
 * @param unit The unit of measurement for which to retrieve the price.
 * @returns The price for the given unit, or -1 if the unit is not recognized.
 */
export function getPrice(data: ItemPrice, unit: string) {
    // Check if the data parameter is not null or undefined
    if (data) {
        // Use a switch statement to check the unit parameter and return the corresponding price from the data object
        switch (unit) {
            case UNITS.BOTTLES:
                return parseFloat(data.bottle.toString());
            case UNITS.VIALS:
                return parseFloat(data.vial.toString());
            case UNITS.CAPSULES:
                return parseFloat(data.capsule.toString());
            case UNITS.TABLETS:
                return parseFloat(data.tablet.toString());
            case UNITS.BOX:
                return parseFloat(data.box.toString());
            default:
                // If the unit parameter is not recognized, return -1
                return -1;
        }
    }
    // If the data parameter is null or undefined, return undefined
    return;
}

/*This function takes in a unit string and returns the corresponding UNITS enum value based on the switch case. If 
the unit does not match any of the cases, it defaults to returning the UNITS.VIALS enum value.*/
export function handleUnits(unit: string): UNITS {
    switch (unit) {
        case 'BOX':
            return UNITS.BOX;
        case 'VIALS':
            return UNITS.VIALS;
        case 'BOTTLES':
            return UNITS.BOTTLES;
        case 'CAPSULES':
            return UNITS.CAPSULES;
        case 'TABLETS':
            return UNITS.TABLETS;
        default:
            return UNITS.VIALS;
    }
}

/**
 * Converts a string representation of a payment status into the corresponding
 * value of the PAYMENT_STATUS enum.
 *
 * @param status The string representation of the payment status to convert.
 * @returns The corresponding value of the PAYMENT_STATUS enum.
 */
function handlePaymentStatus(status: string): PAYMENT_STATUS {
    switch (status) {
        case 'SUCCESS':
            return PAYMENT_STATUS.SUCCESS;
        case 'FAILED':
            return PAYMENT_STATUS.FAILED;
        case 'CANCELLED':
            return PAYMENT_STATUS.CANCELLED;
        default:
            return PAYMENT_STATUS.FAILED;
    }
}

// This function accepts an array of ItemSalesComputationData objects and returns a TotalData object.
// The TotalData object contains the following properties:
// - grossAmount: the sum of the grossAmount property of all items in the input array, rounded to 2 decimal places
// - netAmount: the sum of the netAmount property of all items in the input array, rounded to 2 decimal places
// - vatExempt: a boolean indicating whether at least one item in the input array is VAT exempt (has vatable property set to false)
// - VATAmount: the sum of the VATAmount property of all VATable items in the input array, rounded to 2 decimal places
// - netVATAmount: the sum of the netAmount property of all VATable items in the input array, minus the VATAmount, rounded to 2 decimal places
// - VATableSales: the sum of the netAmount property of all VATable items in the input array, rounded to 2 decimal places
// - nonVATSales: the sum of the netAmount property of all non-VATable items in the input array, rounded to 2 decimal places

export function getTotal(data: ItemSalesComputationData[]): TotalData {
    const isVATExempt = data.some((item: ItemSalesComputationData) => {
        if (item['vatable'] === false) {
            return true;
        }
        return false;
    });

    const VATAmount = Math.round(_.sumBy(_.filter(data, { vatable: true }), 'VATAmount') * 100) / 100;

    return {
        grossAmount: Math.round(_.sumBy(data, 'grossAmount') * 100) / 100,
        netAmount: Math.round(_.sumBy(data, 'netAmount') * 100) / 100,
        vatExempt: isVATExempt,
        VATAmount: VATAmount,
        netVATAmount: Math.round((_.sumBy(_.filter(data, { vatable: true }), 'netAmount') - VATAmount) * 100) / 100,
        VATableSales: Math.round(_.sumBy(_.filter(data, { vatable: true }), 'netAmount') * 100) / 100,
        nonVATSales: Math.round(_.sumBy(_.filter(data, { vatable: false }), 'netAmount') * 100) / 100,
    };
}

/**
 * Calculates the due date of a sales invoice based on the date issued and the payment term.
 * @param item The sales invoice / delivery recipt data object.
 * @returns A string representing the due date in the format "yyyy-mm-dd".
 */
export function calculateDueDate(item: any): string {
    // Convert the date issued to a Date object
    const date = new Date(item.dateIssued);

    // Add the payment term to the date
    date.setDate(date.getDate() + item.term);

    // Convert the resulting date to a string in the format "yyyy-mm-dd"
    const dueDate = date.toISOString().substring(10, 0);

    // Return the due date string
    return dueDate;
}

/**
 * Generates a sales record object based on the given sales invoice data and router object.
 * @param item The sales invoice data used to generate the sales record.
 * @param router The router object used to handle the Process Payment button click.
 * @returns A sales record object containing the relevant data from the sales invoice data and a Process Payment button.
 */

export const salesRecord = (item: any, router: NextRouter) => {
    const dueDate = calculateDueDate(item);

    return {
        id: item.id,
        siOrDrNo: item.salesInvoiceNumber !== undefined ? item.salesInvoiceNumber : item.deliveryReciptNumber,
        clientsName: item.client.clientInfo.companyName,
        dateIssued: item.dateIssued.substring(10, 0),
        dueDate: dueDate,
        amountDue: parseFloat(parseFloat(item.payables).toFixed(2)).toLocaleString(),
        amountPaid: parseFloat(parseFloat(item.amountPaid).toFixed(2)).toLocaleString(),
        balance: parseFloat(parseFloat(item.balance).toFixed(2)).toLocaleString(),
        status: item.isPaid
            ? parseFloat(item.balance) > 0
                ? createElement(Header, { content: 'Overpayment', color: 'green', as: 'h5' })
                : createElement(Header, { content: 'Paid', color: 'green', as: 'h5' })
            : createElement(Header, { content: 'Unpaid', color: 'red', as: 'h5' }),
        action: item.isPaid
            ? createElement(Button, {
                  onClick: () => {
                      router.push(
                          `http://localhost:3000/sales/collection/processPayment/${item.id}/${
                              item.salesInvoiceNumber !== undefined ? 'SI' : 'DR'
                          }`,
                      );
                  },
                  color: 'blue',
                  children: 'View',
              })
            : createElement(Button, {
                  onClick: () => {
                      router.push(
                          `http://localhost:3000/sales/collection/processPayment/${item.id}/${
                              item.salesInvoiceNumber !== undefined ? 'SI' : 'DR'
                          }`,
                      );
                  },
                  color: 'blue',
                  children: 'Process Payment',
              }),
    };
};

export const documentRecord = async (items: any, router: NextRouter) => {
    const getPaymentInfo = async (item: any) => {
        const dueDate = calculateDueDate(item);

        const paymentInfo = await axios.get(`http://localhost:3000/api/collection/documents/${item.id}`);

        const checkNumbers = paymentInfo.data.data
            .map((check: any) => {
                return check.modeOfPayment !== 'CASH' ? check.checkNumber : '';
            })
            .filter((str: string) => str !== '')
            .join(', ');

        const outstandingBalance = parseFloat(item.totalAmount) - parseFloat(item.amountPaid);

        // console.log(outstandingBalance);
        return {
            id: item.id,
            siOrDrId: item.id,
            siOrDrNo: item.salesInvoiceNumber !== undefined ? item.salesInvoiceNumber : item.deliveryReciptNumber,
            amount: parseFloat(parseFloat(item.totalAmount).toFixed(2)),
            dateIssued: item.dateIssued.substring(10, 0),
            dueDate: dueDate,
            checkNumber: checkNumbers === '' ? '-' : checkNumbers,
            amountDue: parseFloat(parseFloat(item.payables).toFixed(2)),
            amountPaid: paymentInfo.data.totalPaid,
            balance: outstandingBalance < 0 ? 0 : outstandingBalance,
            status: item.isPaid ? (parseFloat(item.balance) > 0 ? 'OverPayment' : 'Paid') : 'Unpaid',
            remarks: '',
        };
    };

    const paymentInfoArray = await Promise.all(
        items.map(async (item: any) => {
            const paymentInfo = await getPaymentInfo(item);
            return paymentInfo;
        }),
    );

    function flattenArray(arr: Array<any>): Array<any> {
        return arr.reduce((acc, val) => (Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val)), []);
    }

    return flattenArray(paymentInfoArray);
};

/**
 * This function filters salesInvoiceData array and returns a new array containing
 * the sales records that match the following conditions:
 * 1. The client ID of the sales record matches the companyId specified in rawData.
 * 2. The isPaid property of the sales record is false.
 * 3. The ID of the sales record is not equal to the salesInvoiceNumber specified in rawData.
 *
 * For each sales record that meets the above conditions, this function calls the salesRecord
 * function to generate a new sales record object with additional information, and returns an
 * array containing all the new sales record objects.
 *
 * @param {Array} salesInvoiceData - The array of sales records to filter and map.
 * @param {Object} rawData - An object containing additional data to use in filtering the sales records.
 * @param {Object} router - An object representing the router used in the salesRecord function.
 * @returns {Array} - An array containing the new sales record objects.
 */

export function filterRecords(salesInvoiceData: any, rawData: any, router: any) {
    return salesInvoiceData
        .filter((item: any) => {
            return (
                item.client.clientInfo.id === rawData.companyId &&
                !salesInvoiceData.isPaid &&
                item.id !== rawData.salesInvoiceNumber
            );
        })
        .map((item: any) => {
            return salesRecord(item, router);
        });
}

/**
 * Filters sales invoices based on the specified criteria
 * @param salesInvoiceData The array of sales invoice data to filter
 * @param rawData The raw data used to filter the sales invoice data
 * @param router The router used to navigate to other pages
 * @param paid Indicates whether to filter paid or unpaid sales invoices (default: false)
 * @param both Indicates whether to return both paid and unpaid sales invoices (default: false)
 * @returns The filtered array of sales invoice data
 */
export function filterSalesInvoices(
    salesInvoiceData: any,
    rawData: any,
    router: any,
    paid: boolean = false,
    both: boolean = false,
) {
    // Filter the sales invoice data to include only those for the current company and exclude the current sales invoice number
    const filteredItems = salesInvoiceData
        .filter((item: any) => {
            return item.client.clientInfo.id === rawData.companyId && item.id !== rawData.salesInvoiceNumber;
        })
        // Filter the sales invoice data to include only paid or unpaid sales invoices based on the specified criteria
        .filter((item: any) => {
            // If both is true, return all sales invoices
            if (both) {
                return true;
            }
            // Otherwise, return only paid or unpaid sales invoices based on the specified criteria
            return item.isPaid === paid;
        })
        // Map the filtered sales invoice data to a new array of sales record data
        .map((item: any) => {
            return salesRecord(item, router);
        });

    // Return the filtered array of sales invoice data
    return filteredItems;
}

/**
 * This function takes in a payment status and returns a JSX Element representing the payment status.
 * @param status - the payment status (SUCCESS, FAILED, CANCELLED)
 * @returns a JSX Element representing the payment status
 */
export function renderPaymentStatus(status: PAYMENT_STATUS): JSX.Element {
    let color: SemanticCOLORS | undefined;
    let content: string;

    // switch statement to set the color and content based on the payment status
    switch (status) {
        case PAYMENT_STATUS.SUCCESS:
            color = 'green';
            content = 'Success';
            break;
        case PAYMENT_STATUS.FAILED:
            color = 'red';
            content = 'Failed';
            break;
        case PAYMENT_STATUS.CANCELLED:
            color = 'yellow';
            content = 'Cancelled';
            break;
        default:
            color = 'black';
            content = '';
            break;
    }

    // return a Header element with the color and content set based on the payment status
    return createElement(Header, {
        color: color,
        content: content,
        as: 'h5',
    });
}

/**
 * This function fetches the balance of a client from a local server using an API call.
 * @param clientId - the ID of the client whose balance is to be fetched
 * @returns a Promise containing the balance of the client as a number
 */
export async function fetchBalance(clientId: string): Promise<number> {
    const res = await axios.get(`http://localhost:3000/api/collection/client/${clientId}`);

    return parseFloat(res.data.data);
}

/**
 * Formats a given numeric string as a currency with commas as thousands separators and two decimal places.
 * @param numString - The numeric string to format.
 * @returns The formatted currency string.
 */
export function formatCurrency(numString: string): string {
    // Convert the input string to a number.
    const num: number = parseFloat(numString);

    // Use toLocaleString() to format the number as a currency with commas as thousands separators and two decimal places.
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface DocumentCounters {
    [documentId: string]: {
        lastMonth: number;
        count: number;
    };
}

const documentCounters: DocumentCounters = {}; // Initialize an empty object to store the counters for each document

function getUniqueId(documentId?: string): string {
    const now = new Date(); // Get the current local date and time
    const year = now.getFullYear().toString(); // Get the current year as a string
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Get the current month as a zero-padded string (e.g., "04" for April)

    let count;
    if (documentId) {
        // If a document ID is provided, use it to create a separate counter for that document
        if (!documentCounters[documentId]) {
            documentCounters[documentId] = { lastMonth: now.getMonth(), count: 1 };
        } else {
            if (documentCounters[documentId].lastMonth !== now.getMonth()) {
                documentCounters[documentId].lastMonth = now.getMonth();
                documentCounters[documentId].count = 1;
            } else {
                documentCounters[documentId].count++;
            }
        }
        count = documentCounters[documentId].count;
    } else {
        // If no document ID is provided, use a global counter
        if (!documentCounters.global) {
            documentCounters.global = { lastMonth: now.getMonth(), count: 1 };
        } else {
            if (documentCounters.global.lastMonth !== now.getMonth()) {
                documentCounters.global.lastMonth = now.getMonth();
                documentCounters.global.count = 1;
            } else {
                documentCounters.global.count++;
            }
        }
        count = documentCounters.global.count;
    }

    const id = year + month + count.toString().padStart(2, '0'); // Combine the year, month, and count into a unique ID string
    return id;
}

export function formatDateString(isoDateString: string): string {
    const date = new Date(isoDateString);
    const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
        date,
    );
    return formattedDate;
}
