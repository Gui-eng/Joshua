import axios from 'axios';
import Itable from 'components/Itable';
import { getPrice, handleUndefined } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import React from 'react'
import { Item } from 'types';

const headerTitle = ["id", "Quantity", "Unit", "Item Name" , "Vatable", "Price", "Batch Number" , "Man. Date", "Exp. Date", "Total Amount"]


enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    CAPSULES = "CAPSULES",
    TABLETS = "TABLETS"
  }

export const getServerSideProps : GetServerSideProps = async (context) => {
    // const session = await getSession(context);
    // const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
  
    try{
        const info = await axios.get(`http://localhost:3000/api/getInfo/salesInvoice/${context.query.id}`)
        return {
            props : { info : info.data.data }
          }
    }catch(error){
        return {
            props : {}
          }
    }
    
    
    
  }

export default function ID( {post, info} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    console.log(info)
   
    // !info ? null

    const tableData = info.items.map((item : any) => {

        const getThePrice = getPrice(handleUndefined(item.ItemInfo?.ItemPrice[0]), item.unit)

        return {
            id: item.id,
            quantity: parseFloat(item.quantity.toString()).toLocaleString(),
            unit: item.unit,
            itemName: item.ItemInfo?.itemName,
            vatable: item.vatable ? 'Yes' : 'No',
            price: getThePrice?.toLocaleString(),
            batchNumber: item.ItemInfo?.batchNumber,
            manDate: item.ItemInfo?.manufacturingDate.toString().substring(10, 0),
            expDate: item.ItemInfo?.expirationDate.toString().substring(10, 0),
            totalAmount: parseFloat( item.totalAmount.toString()).toLocaleString()
          }
    })
    
  return (
    <div>{
    <>
        <div className='tw-w-full tw-flex tw-justify-center'>
            <div className='tw-w-[90%] tw-pt-8 tw-bg-sky-600 tw-bg-opacity-30 tw-rounded-tl-lg tw-rounded-tr-lg tw-mt-4 tw-flex tw-flex-col tw-items-center'>
                <div className='tw-flex tw-w-[90%] tw-pb-4'>
                    <h1 className='tw-text-2xl tw-font-bold'>Sales Invoice Summary</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Sales Invoice # : </h1><h1 className='tw-font-bold'>{info.salesInvoiceNumber}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Date Issued : </h1><h1 className='tw-font-bold'>{info.dateIssued.substring(10,0)}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>PMR/ Medical Representative : </h1><h1 className='tw-font-bold'>{info.pmr.employeeInfo.code + " " + info.pmr.employeeInfo.firstName + " " + info.pmr.employeeInfo.lastName }</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Prepared By : </h1>{info.preparedBy.employeeInfo.firstName + " " + info.preparedBy.employeeInfo.lastName}<h1 className='tw-font-bold'></h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-[90%] tw-pb-4 tw-justify-start'><h1 >Total Amount : </h1><h1 className='tw-font-bold'>{parseFloat(info.totalAmount).toLocaleString()}</h1></div>
                    {/* <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Type : </h1><h1 className='tw-font-bold'></h1></div> */}
                </div>
               
            </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Itable color='blue' data={tableData} headerTitles={headerTitle}/>
           </div>
        </div>
    </>}</div>
  )
}
