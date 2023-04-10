import axios from 'axios';
import Itable from 'components/IFlexTable';
import IFooter from 'components/IFooter'
import Inav from 'components/Inav'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button, Header } from 'semantic-ui-react';

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
    
    const info = await axios.get(`http://localhost:3000/api/getInfo/item`)
    return {
      props : { post : res.data.data, info : info.data }
    }
    
}

const headerTitles = ["id", "Item Id", "Item Name", "Batch No.", "Man. Date", "Exp. Date", "Summary"]

export default function index({ post, info }  : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()

  const [data, setData] = useState(info.data.map((item : any) => {
    return {
        id : item.id,
        itemId : item.id,
        itemName : item.itemName,
        batchNumber : item.batchNumber,
        manufacturingDate : item.manufacturingDate.substring(10, 0),
        expirationDate : item.expirationDate.substring(10, 0),
        view : <Button onClick={() => {router.push(`http://localhost:3000/inventory/items/${item.id}`)}}color='blue'>View</Button>
    }
}))





  return (
    <>
    <div className='tw-w-full tw-h-full'>
    <Inav firstName={post.employeeInfo.firstName}/>
      <div className='tw-w-full tw-flex tw-flex-col tw-h-[80vh]'>
           <div className='tw-w-full tw-flex tw-justify-center tw-my-8'>
                <div className='tw-w-[90%]'>
                    <h1 className='tw-text-2xl tw-font-bold'>Item List</h1>
                </div>
            </div>
            <div className='tw-w-full tw-flex tw-justify-center '>
                <div className='tw-w-[90%]'>
                    <Itable allowDelete={false} headerTitles={headerTitles} data={data} />
                </div>
            </div>
      </div>
    </div>
    <IFooter/>
  </>
  )
}
