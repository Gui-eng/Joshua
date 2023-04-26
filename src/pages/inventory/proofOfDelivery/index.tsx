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




const headerTitles = ["id", "POD #", "Date Issued", "Client", "Actions"]

export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

  const proofOfDeliveryData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/inventory/proofOfDelivery/add`)
  
  return {
    props : { post : res.data.data, proofOfDeliveryData : proofOfDeliveryData.data.data }
  }
  
}

export default function index({ post , proofOfDeliveryData} : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();

  console.log(proofOfDeliveryData)
  const list = removeDuplicates(proofOfDeliveryData, 'proofOfDeliveryNumber')

  const tableData = list.map((item : any) => {
    return {
        id : item.id,
        pullOutNumber : item.proofOfDeliveryNumber,
        dateIssued : formatDateString(item.dateRequested),
        client : item.deliveredClient.companyName,
        actions : <Button color='blue' onClick={() => {router.push(`/inventory/proofOfDelivery/view/${item.proofOfDeliveryNumber}`)}} >View</Button>
  }})

 
  return (
   session.data && 
    <div>
      <Inav/>
      <div className='tw-w-full tw-pb-60 tw-flex tw-flex-col'>
            <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-20 tw-ml-20 tw-mb-20'>Proof of Delivery List</h1>
            <div className='tw-w-full tw-flex tw-justify-center'>
              <div className='tw-w-[90%]'>
                  <Itable data={tableData} headerTitles={headerTitles}/>
              </div>
            </div>
            <div className='tw-ml-20 tw-mt-4'>
              <Button onClick={() => {router.push('/inventory/proofOfDelivery/add')}}color='blue'>Add Proof Of Delivery</Button>
            </div>
      </div>
      
    </div>
  )
}
