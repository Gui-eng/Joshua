import axios from 'axios';
import Itable from 'components/Itable';
import { HOSTADDRESS, PORT, formatCurrency, formatDateString, getPrice, handleUndefined } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import { Button, Header } from 'semantic-ui-react';
import { Item } from 'types';

const headerTitle = ["id", "Quantity", "Item Name", "Manufacturing Date", "Expiration Date", "Batch Number"]


enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    CAPSULES = "CAPSULES",
    TABLETS = "TABLETS"
  }

export const getServerSideProps : GetServerSideProps = async (context) => {
    // const session = await getSession(context);
    // const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
  
    try{
        const pullOutData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/inventory/receivingReport/${context.query.id}`)
        
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

    const [del, setDel] = useState(false);
    const router = useRouter()
    

    const tableData = info.items.map((item : any) => {
        return {
           id : item.id,
           quantity : item.quantity,
           name : item.itemName,
           mfgdate : formatDateString(item.manufacturingDate),
           expdate : formatDateString(item.expirationDate),
           batchNumber : item.batchNumber

        }
    })

   

    async function handleDeleteDocument(){
        try {
          const deletePOD = await axios.delete(`http://${HOSTADDRESS}:${PORT}/api/inventory/receivingReport/${info.id}`)
          router.push('/inventory/receivingReport')
        } catch (error) {
          console.log(error)
        }
      }
    
  return (
    <div>{
    <>
         <div className='tw-w-full tw-flex tw-justify-center'>
            <div className='tw-w-[90%] tw-pt-8 tw-bg-sky-600 tw-bg-opacity-30 tw-rounded-tl-lg tw-rounded-tr-lg tw-mt-4 tw-flex tw-flex-col tw-items-center'>
                <div className='tw-flex tw-w-[90%] tw-pb-4'>
                    <h1 className='tw-text-2xl tw-font-bold'>Receiving Report Summary</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>RR# : </h1><h1 className='tw-font-bold'>{info.receivingReportNumber}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Date Issued : </h1><h1 className='tw-font-bold'>{formatDateString(info.dateIssued)}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Supplier : </h1><h1 className='tw-font-bold'>{info.supplier}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Address : </h1><h1 className='tw-font-bold'>{info.address}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>TIN : </h1><h1 className='tw-font-bold'>{info.TIN}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Terms : </h1><h1 className='tw-font-bold'>{info.term}</h1></div>
                </div>
            </div>
        </div>
        
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Itable color='blue' data={tableData} headerTitles={headerTitle}/>
                <div className='tw-w-full tw-flex tw-justify-end tw-pt-4'>
                    
                    {!del ?  <Button className='' color='red' inverted onClick={() => { setDel(true)}}>Delete</Button> : null}
                    
                    {del ? <div className='tw-flex-col tw-justify-end'>
                            <Header as='h5' className='tw-pr-2'>Are you sure to delete?</Header>
                            <div className='tw-flex'>
                                <Button className='' color='red' inverted onClick={() => { handleDeleteDocument()}}>Yes</Button> 
                                <Button className='' color='blue' inverted onClick={() => { setDel(false)}}>No</Button>
                            </div>
                </div>: null}

        </div>
           </div>
        </div>
    </>
    }</div>
  )
}
