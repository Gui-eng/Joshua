import { PAYMENT, SalesInvoice } from '@prisma/client';
import { String } from 'lodash';
import { SemanticCOLORS } from 'semantic-ui-react';

export const localhost = '192.168.1.101';

export enum UNITS {
    BOX = 'BOX',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    CAPSULES = 'CAPSULES',
    TABLETS = 'TABLETS',
}

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

//Clients
export interface ClientInfo {
    id?: string;
    companyName: string;
    address: string;
    TIN: string;
    pmrId: string;
}

export interface Client {
    id?: string;

    clientInfo?: ClientInfo;
    clinetInfoId?: string;
    salesInvoice?: SalesInvoiceData;
    salesInvoiceId?: string;

    client?: SalesInvoiceData[];
}

export interface Option {
    id: string;
    key: string;
    value: string | boolean;
    text: string;
}

export interface CheckInfo {
    id: string;
    modeOfPayment: PAYMENT;
    checkNumber: string;
    salesInvoiceNumber: string;
    checkDate: string;
    depositDateAndTime: string;
    depositTime: string;
    amount: number;

    documentData?: SalesInvoiceData | DeliveryReciptData;
}

//Item

export interface ItemInfo {
    id?: string;
    itemName: string;
    batchNumber: string;
    manufacturingDate: string | Date;
    expirationDate: string | Date;
    VAT: boolean;
    price?: ItemPrice;
    stocks?: ItemStocks;
    ItemPrice?: ItemPrice;
}

export interface ItemStocks {
    id?: string;
    vial: number;
    bottle: number;
    box: number;
    capsule: number;
    tablet: number;
    pmrEmployeeId: string;
    itemInfoId: string;
}

export interface ItemPrice {
    id?: string;
    bottle: number | string;
    vial: number | string;
    capsule: number | string;
    tablet: number | string;
    box: number | string;
    itemInfoId: string;
}

export interface Item {
    id?: string;
    quantity: number;
    unit: string | UNITS;
    discount?: number;
    unitPrice: number;
    totalAmount: number;
    itemSalesDetails: ItemSalesDetails;

    vatable: boolean;
    isPullout?: boolean;

    SI?: SalesInvoiceData;
    sIId?: string;
    ItemInfo?: ItemInfo;
    itemInfoId?: string;
}

//Employee
export interface EmployeeInfo {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    code: string;
    address: string;
    dateHired: string;
    department: string;
    contactNo: string;
}

export interface Employee {
    id?: string;

    employeeInfo: EmployeeInfo;
    employeeinfoId: string;
    SalesInvoiceId: string;
    DeliveryReciptId: string;

    SIPmr: SalesInvoiceData[];
    SIPreparedBy: SalesInvoiceData[];
}

export interface TableProps {
    data: Array<any>;
    headerTitles: Array<string>;
    color?: SemanticCOLORS;
    handleEditing?: any;
    allowEditing?: boolean;
    allowDelete?: boolean;
    updateItem?: any;
    extraData?: any;
    otherDiscount?: number;
    hasFooter?: boolean;
}

export interface SalesInvoiceData {
    id?: string;
    salesInvoiceNumber: string;
    dateIssued: string;
    totalAmount: number;
    term: number;
    discount?: number;
    VAT: number;
    remarks?: string;

    isRemote: boolean;
    stockIn?: boolean;
    isPullout?: boolean;
    isPaid?: boolean;

    item: Item[];
    pmr?: Employee;
    pmrEmployeeId?: string;
    preparedBy?: Employee;
    preparedById?: string;
    client?: ClientInfo;
    clientId?: string;
    itemSummaryId?: string;
    proofOfDelivery?: proofOfDeliveryData[];
    proofOfDeliveryId?: string;
}

export interface DeliveryReciptData {
    id?: string;
    deliveryReciptNumber: string;
    dateIssued: string;
    term: number;
    totalAmount: number;
    VAT: number;
    discount?: number;
    remarks?: string;
    total: TotalData;

    //sales and inventory Stuff
    isRemote: boolean;
    stockIn?: boolean;
    isPullout?: boolean;
    isPaid?: boolean;

    item: Item[];
    pmr?: Employee;
    pmrEmployeeId?: string;
    preparedBy?: Employee;
    preparedById?: string;
    client?: ClientInfo;
    clientId?: string;
    itemSummaryId?: string;
    proofOfDelivery?: proofOfDeliveryData[];
    proofOfDeliveryId?: string;
}

export interface proofOfDeliveryData {
    id?: string;

    remarks: string;
    dateRequested: Date | string;

    deliveredClient?: ClientInfo;
    deliveryClientId?: string;
    pmr?: EmployeeInfo;
    pmrId?: string;

    salesInvoice?: SalesInvoiceData[];
}

export interface ItemSalesComputationData {
    itemId: string;
    VATAmount: number;
    grossAmount: number;
    netAmount: number;
    vatable: boolean;
    discount: number;
    otherDiscount?: Array<any>;
}

export interface TotalData {
    grossAmount: number;
    netAmount: number;
    vatExempt: boolean;
    VATAmount: number;
    netVATAmount: number;
    VATableSales: number;
    nonVATSales: number;
}

export interface ItemSalesDetails {
    itemId: string;
    grossAmount: number;
    discount: number;
    netAmount: number;
    VATAmount: number;
    vatable: boolean;
}

export interface RawDataOfProcessPayment {
    id: string;
    checkNumber: string;
    checkDate: string;
    ARCR: string;
    depositTime: string;
    amount: number;
    ewt: number;
    dateOfDeposit: string;
    modeOfPayment: string;
    documentData: SalesInvoiceData | DeliveryReciptData;
    dateIssued: string;
    deductFromBalance: boolean;
    remarks?: string;
    balance?: number;
    prevAmount?: number;
    prevBal?: number;
}
