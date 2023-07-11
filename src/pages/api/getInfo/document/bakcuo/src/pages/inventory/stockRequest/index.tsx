import axios from 'axios'
import IFooter from 'components/IFooter'
import ISideCard from 'components/ISideCard'
import Inav from 'components/Inav'
import Itable from 'components/Itable'
import { HOSTADDRESS, PORT, formatDateString, removeDuplicates } from 'functions'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Button, Header } from 'semantic-ui-react'
import { SalesInvoiceData } from 'types'




const headerTitles = ["id", "SR #", "Date Issued", "Requested By", "Actions"]

export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

  const stockRequestData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/inventory/stockRequest/add`)
  
  return {
    props : { post : res.data.data, stockRequestData : stockRequestData.data.data }
  }
  
}

export default function index({ post , stockRequestData } : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();

  const list = removeDuplicates(stockRequestData , 'stockRequestNumber')

  const tableData = list.map((item : any) => {
    return {
        id : item.id,
        number : item.stockRequestNumber,
        dateIssued : formatDateString(item.dateRequested),
        requested : item.requestedBy.code + " " + item.requestedBy.firstName,
        actions : <Button color='blue' onClick={() => {router.push(`/inventory/stockRequest/view/${item.stockRequestNumber}`)}} >View</Button>
  }})

 
  return (
   session.data && 
    <div>
      <Inav/>
      <div className='tw-w-full tw-pb-60 tw-flex tw-flex-col'>
            <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-20 tw-ml-20 tw-mb-20'>Stock Request List</h1>
            <div className='tw-w-full tw-flex tw-justify-center'>
              <div className='tw-w-[90%]'>
                  <Itable data={tableData} headerTitles={headerTitles}/>
              </div>
            </div>
            <div className='tw-ml-20 tw-mt-4'>
              <Button onClick={() => {router.push('/inventory/stockRequest/add')}}color='blue'>Add Stock Request</Button>
            </div>
      </div>
      
    </div>
  )
}
