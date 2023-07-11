import axios from 'axios';
import Itable from 'components/Itable';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react'
import { Button, Input } from 'semantic-ui-react';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import ComponentToPrint from 'components/ISOA';
import { documentRecord, formatCurrency } from 'functions';




const headerTitle = ["id", "SI/DR No.", "SI/DR Amount" , "Date Issued", "Due Date", "Amount Paid", "CR/AR No." , "Description", "Amount Outstanding", "Remarks"]

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
    const clients = await axios.get(`http://localhost:3000/api/getInfo/client/${context.query.id}`)
    const document = await axios.get(`http://localhost:3000/api/getInfo/document/client/${context.query.id}`)
    const totalAmountDue = await axios.get(`http://localhost:3000/api/collection/SOA/totalAmountDue/${context.query.id}`)
    
    return {
      props : { post : res.data.data, clientsData : clients.data.data, documentData: document.data.data, totalAmounDue : totalAmountDue.data.data }
    }
    
}

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




export default function ID({ clientsData, documentData, totalAmounDue } : InferGetServerSidePropsType<typeof getServerSideProps>) {

    const router = useRouter()


    const [rawData, setRawData] = useState<any>({
        totalAmountDue : formatCurrency(totalAmounDue.toString()),
        companyName : clientsData.companyName,
        id : clientsData.id,
        address : clientsData.address,
        data : []
    })
    const [tableData, setTableData] = useState([])

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

    useEffect(() => {
        const fetchDocs = async () => {
            const docs = await documentRecord(documentData, router)
            setRawData({...rawData, data : docs})
        }
        fetchDocs()
    }, [])
    
    function updateRemarksById(id: string, remarks: string): void {

        const newData = rawData.data.map((dataItem : any) => {
            if (dataItem.id === id) {
              return { ...dataItem, remarks };
            }
            return dataItem;
          });

        setRawData({...rawData, data : newData})
      }

   useEffect(() => {
    if(rawData !== undefined){
    

        setTableData(rawData.data.map((item : any) => {
            return {
                id: item.id,
                number : item.siOrDrNo,
                totalAmount : formatCurrency(item.amount.toString()),
                dateIssued : item.dateIssued,
                dueDate : item.dueDate,
                amountPaid : formatCurrency(item.amountPaid),
                crOrArNo : item.modeOfPayment === 'CASH' ? '-' : item.checkNumber,
                status : item.status,
                outstadningAmount : formatCurrency(item.balance),
                action : <Input type='text' onChange={(e) => {
                    updateRemarksById(item.id, e.target.value)
                }} />
    
            }
        }))
    }
   }, [rawData])


   async function viewExcel(){  

        const res = await axios.post('http://localhost:3000/api/collection/SOA/print', rawData)
        router.reload()
   }
   
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
                    <div className='tw-flex tw-gap-1 tw-items-center tw-w-full tw-justify-start'><h1>Clients Name : </h1><h1 className='tw-font-bold'>{clientsData.companyName}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Last Date Issued: </h1><h1 className='tw-font-bold'>{data.lastDateIssued}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Address:  </h1><h1 className='tw-font-bold'>{clientsData.address}</h1></div>
                </div>
                    <div className='tw-w-full tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-[90%] tw-pb-4 tw-justify-star'><h1 >Total Balance Due: </h1><h1 className='tw-font-bold'>{formatCurrency(totalAmounDue.toString())}</h1>
                    </div>
                </div>
               
            </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
            { tableData.length > 0 && <Itable color='blue' data={tableData} headerTitles={headerTitle}/>}
           </div>
           
        </div>
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%] tw-pt-4'>
                <Button color='blue' onClick={viewExcel}>Print SOA</Button>
                <div className='tw-hidden'>
          
                     <ComponentToPrint ref={componentRef} />

                </div>
           </div>
        </div>
    </></div>
  )
}
