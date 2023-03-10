import axios from 'axios';
import Itable from 'components/Itable';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useRef } from 'react'
import { Button } from 'semantic-ui-react';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import ComponentToPrint from 'components/ISOA';


const headerTitle = ["id", "Invoice No.", "Invoice Date", "Invoice Amount" , "Due Date", "Amount Paid", "CR/AR No." , "Description", "Amount Outstanding"]

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

export default function ID() {

    const router = useRouter()
    const data = sample
    const componentRef = useRef(null)
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        pageStyle: `
        @media print {
          @page {
            size: portrait;
          }
        }
      `,
    });
   
  return (
    <div>
    <>
        <div className='tw-m-4'>
                    <Button onClick={() => {router.push('/sales/')}} color='blue' >Go Back</Button>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center'>
            
            <div className='tw-w-[90%] tw-pt-8 tw-bg-sky-600 tw-bg-opacity-30 tw-rounded-tl-lg tw-rounded-tr-lg tw-mt-4 tw-flex tw-flex-col tw-items-center'>
            
                <div className='tw-flex tw-w-[90%] tw-pb-4'>
                    <h1 className='tw-text-2xl tw-font-bold'>Statement of Account</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-items-center tw-w-full tw-justify-start'><h1>Clients Name : </h1><h1 className='tw-font-bold'>{data.companyName}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Last Date Issued: </h1><h1 className='tw-font-bold'>{data.lastDateIssued}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Address:  </h1><h1 className='tw-font-bold'>{data.address}</h1></div>
                </div>
                    <div className='tw-w-full tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-[90%] tw-pb-4 tw-justify-star'><h1 >Total Balance Due: </h1><h1 className='tw-font-bold'>{data.totalBalance().toLocaleString()}</h1>
                    </div>
                </div>
               
            </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Itable color='blue' data={sampleTableData} headerTitles={headerTitle}/>
           </div>
           
        </div>
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%] tw-pt-4'>
                <Button color='blue' onClick={handlePrint}>Print SOA</Button>
                <div className='tw-hidden'>
          
                     <ComponentToPrint ref={componentRef} />

                </div>
           </div>
        </div>
    </></div>
  )
}
