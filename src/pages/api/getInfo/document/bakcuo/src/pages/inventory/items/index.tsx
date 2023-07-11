import axios from 'axios';
import Itable from 'components/IFlexTable';
import IFooter from 'components/IFooter'
import Inav from 'components/Inav'
import { HOSTADDRESS, PORT } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button, Header } from 'semantic-ui-react';

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
    console.log(session)


    const info = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item`)
    return {
      props : { post : res.data.data, info : info.data }
    }
    
}

const headerTitles = ["id","Batch No.", "Item Name",  "Man. Date", "Exp. Date", "Summary"]

export default function index({ post, info }  : InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()

  const [data, setData] = useState(info.data.map((item : any) => {

    return {
        id : item.id,
        batchNumber : item.batchNumber,
        itemName : item.itemName,
        manufacturingDate : item.manufacturingDate.substring(10, 0),
        expirationDate : item.expirationDate.substring(10, 0),
        view : <Button onClick={() => {router.push(`http://${HOSTADDRESS}:${PORT}/inventory/items/${item.id}`)}}color='blue'>View</Button>
    }

}))





  return (
    <>
    <div className='tw-w-full tw-h-full'>
    <Inav/>
      <div className='tw-w-full tw-flex tw-flex-col tw-pb-60'>
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
