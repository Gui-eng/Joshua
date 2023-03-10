import React from 'react';
import Itable from './IFlexTable';
import logo from '../public/logo.jpeg'
import { Image, Table, TableBody, TableHeader } from 'semantic-ui-react';

const headerTitle = [ "Invoice No.", "Invoice Date", "Invoice Amount" , "Due Date", "Amount Paid", "CR/AR No." , "Description", "Amount Outstanding"]

const sample = {
    companyName: "Super H. Drug",
    address : "123 Oak Street",
    previousBalance : 8000,
    newCredits : 2000,
    pullOut : 0,
    lastDateIssued : '2023-03-08',
    totalBalance () {
        return this.previousBalance + this.newCredits
    }
}


const sampleTableData = [
    {
        id : "123",
        invoiceNumber : "89901",
        invoiceDate : '2023-03-01',
        invoiceAmount : 4000,
        dueDate : '2023-06-01',
        amountPaid : 5000,
        checkNumber : "1231",
        description : "Overpaid",
        outstandingAmount : 1000,
    },
    {
        id : "1231",
        invoiceNumber : "89902",
        invoiceDate : '2023-04-01',
        invoiceAmount : 4000,
        dueDate : '2023-07-01',
        amountPaid : 2000,
        checkNumber : "1232",
        description : "Underpaid",
        outstandingAmount : 2000,
    }
]

function getDate() : string{
    const date = new Date(Date.now())
    const localDate = new Date(date.getTime() +  24 * 60 * 1000).toISOString()

    return localDate.substring(0, 10)
}

export default class ComponentToPrint extends React.PureComponent {
    
    render() {
      return (
        <div className={`tw-w-screen tw-p-4 tw-items-center tw-tw-flex tw-flex-col`}>
           <div className='tw-flex tw-w-full tw-pt-4 tw-justify-between tw-items-center'>
                <div className='tw-flex'>
                    <Image src={logo.src} size='small'/>
                    <div>
                        <h3 className='tw-font-bold'>United Pharma Plus &#40;UniPharma&#41;</h3>
                        <h3> 1420 37F Masangkay St., Sta. Cruz, Manila</h3>
                        <h3>Tel: 8354-27-25</h3>
                    </div>
                </div>
                <div>
                        <h1 className='tw-text-2xl tw-font-bold'>Statement Of Account</h1>
                </div>
           </div>
           <div className='tw-flex tw-w-full tw-justify-between'>
                <div className=' tw-mt-8 tw-w-[40%]'>
                    <table className='tab' width={'100%'}>
                            <tbody>
                                <tr >
                                    <th className='tw-text-left' colSpan={2}>Billed to: </th>
                                </tr>
                                <tr>
                                    <td className='tw-font-bold' >Account Name: </td>
                                    <td>{sample.companyName} </td>
                                </tr>
                                <tr>
                                    <td className='tw-font-bold' >Address: </td>
                                    <td>{sample.address}</td>
                                </tr>
                            </tbody>
                        </table>
                </div>
                <div className=' tw-mt-8 tw-w-[40%]'>
                    <table className='tab' width={'100%'}>
                            <tbody>
                                <tr>
                                    <td className='tw-font-bold'>Date: </td>
                                    <td>{getDate()} </td>
                                </tr>
                                <tr>
                                    <td className='tw-font-bold'>Statement No. </td>
                                    <td>{1}</td>
                                </tr>
                                <tr>
                                    <td className='tw-font-bold'>Page No. </td>
                                    <td>1 of 1</td>
                                </tr>
                            </tbody>
                        </table>
                </div>
           </div>

            <div className='tw-w-full tw-flex tw-justify-center'>
                <div className='tw-mt-8 tw-w-[95%]'>
                        <table className='tab' width={'100%'}>
                                <tbody>
                                    <tr>
                                        {headerTitle.map((item : string) => {
                                            return <th>{item}</th>
                                        })}
                                    </tr>
                                    {sampleTableData.map((items : any) => {
                                        return <tr>
                                            <td className='tw-text-left'>{items.invoiceNumber}</td>
                                            <td className='tw-text-left'>{items.invoiceDate}</td>
                                            <td className='tw-text-left'>{items.invoiceAmount}</td>
                                            <td className='tw-text-left'>{items.dueDate}</td>
                                            <td className='tw-text-left'>{items.amountPaid}</td>
                                            <td className='tw-text-left'>{items.checkNumber}</td>
                                            <td className='tw-text-left'>{items.description}</td>
                                            <td className='tw-text-left'>{items.outstandingAmount}</td>
                                        </tr>
                                    })}
                                </tbody>
                            </table>
                    </div>
            </div>
        </div>
      );
    }
  }