import { String } from 'lodash';

export interface CollectionData {
    id: string;
    salesInvoiceNumber: string;
    clientsName: string;
    dateIssued: string;
    amountDue: number;
    balance: number;
    amountPaid: number;
    terms: number;
}

export interface ClientInfo {
    id: string;
    companyName: string;
    address: string;
    TIN: string;
}

export interface Option {
    key: string;
    value: string;
    text: string;
}

export interface CheckInfo {
    id: string;
    method: string;
    checkNumber: string;
    salesInvoiceNumber: string;
    checkIssued: string;
    checkDepositDate: string;
    depositTime: string;
    amount: number;
}
