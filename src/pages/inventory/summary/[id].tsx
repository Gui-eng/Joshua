import axios from 'axios';
import Itable from 'components/IFlexTable';
import IFooter from 'components/IFooter'
import Inav from 'components/Inav'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button, Header, Table } from 'semantic-ui-react';

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const { id } = context.query;
    const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
    
    const info = await axios.get(`http://localhost:3000/api/getInfo/item/stocks/${id}`)

    const pmr = await axios.get(`http://localhost:3000/api/getInfo/employee/pmr/${id}`)
    return {
      props : { post : res.data.data, info : info.data, pmr : pmr.data.data }
    }
    
}

const headerTitles = ["id","Item Name", "Batch No.", "Man. Date", "Exp. Date", "Remaining Vial/s",  "Remaining Bottle/s", "Remaining Box/es", "Remaining Piece/s", "Summary"]

export default function index({ post, info, pmr }  : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
 

  const [data, setData] = useState(info.data.map((item : any) => {
    const { itemInfo } = item 
    return {
        id : item.id,
        itemName : itemInfo.itemName,
        batchNumber : itemInfo.batchNumber,
        manufacturingDate : itemInfo.manufacturingDate.substring(10, 0),
        expirationDate : itemInfo.ExpirationDate.substring(10, 0),
        remainingVial : item.stocksVial,
        remainingBottle : item.stocksBottle,
        remainingBox : item.stocksBox,
        remainingPiece : item.stocksPiece,


    }
}))


   

  return (
    <>
    <div className='tw-w-full tw-h-full'>
     <Inav firstName={post.employeeInfo.firstName}/>
      <div className='tw-w-full tw-flex tw-flex-col tw-pb-[50vh]'>
           <div className='tw-w-full tw-flex tw-justify-center tw-my-8'>
                <div className='tw-w-[90%]'>
                    <h1 className='tw-text-2xl tw-font-bold'>{pmr.firstName + " " + pmr.lastName}</h1>
                </div>
            </div>
            <div className='tw-w-full tw-flex tw-justify-center '>
                <div className='tw-w-[90%]'>
                    <Itable allowDelete={false} headerTitles={headerTitles} data={data} editing={false} />
                </div>
            </div>
      </div>
    </div>
    <IFooter/>
  </>
  )
}
