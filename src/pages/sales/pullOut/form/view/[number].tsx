import axios from 'axios';
import Itable from 'components/Itable';
import { formatCurrency, getPrice, handleUndefined } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import React from 'react'
import { Item } from 'types';

const headerTitle = ["id", "SI #", "Quantity", "Prodcut Name", "MFG. Date", "EXP Date" , "Batch Number", "Amount"]


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
        const pullOutData = await axios.get(`http://localhost:3000/api/pullOut/${context.query.number}`)
        
        return {
            props : { info : pullOutData.data.data }
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

    

    const tableData = info.map((item : any) => {
        return {
        id : item.id,
           number : item.documentNumber,
           quantity : item.quantity + " " + item.unit,
           name : item.itemName,
           mfgdate : item.manufacturingDate.substring(10, 0),
           expdate : item.expirationData.substring(10, 0),
           batchNumber : item.batchNumber,
           amount : formatCurrency(item.totalAmount)
        }
    })

    
  return (
    <div>{
    <>
         <div className='tw-w-full tw-flex tw-justify-center'>
            <div className='tw-w-[90%] tw-pt-8 tw-bg-sky-600 tw-bg-opacity-30 tw-rounded-tl-lg tw-rounded-tr-lg tw-mt-4 tw-flex tw-flex-col tw-items-center'>
                <div className='tw-flex tw-w-[90%] tw-pb-4'>
                    <h1 className='tw-text-2xl tw-font-bold'>Pull Out Summary</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>PO# : </h1><h1 className='tw-font-bold'>{info[0].pullOutNumber}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Date Issued : </h1><h1 className='tw-font-bold'>{info[0].dateIssued.substring(10, 0)}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Company Name : </h1><h1 className='tw-font-bold'>{info[0].client.companyName }</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Company Address: </h1><h1 className='tw-font-bold'>{info[0].client.address}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-[90%] tw-pb-4 tw-justify-start'><h1 >Total Amount : </h1><h1 className='tw-font-bold'>{parseFloat(info[0].totalAmount.toString()).toLocaleString()}</h1></div>
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
