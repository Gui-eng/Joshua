import axios from 'axios'
import IFooter from 'components/IFooter'
import ISideCard from 'components/ISideCard'
import Inav from 'components/Inav'
import Itable from 'components/Itable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Button, Header } from 'semantic-ui-react'
import { DeliveryReciptData, SalesInvoiceData } from 'types'


const headerTitles = ["id", "DR #", "Date Issued", "Med Rep", "Prepared By", "Total Amount", "Remarks", "Actions"]

export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)

  const deliveryReciptData = await axios.get('http://localhost:3000/api/sales/viewDR')
  
  return {
    props : { post : res.data.data, deliveryReciptData : deliveryReciptData.data.data }
  }
  
}

export default function index({ post , deliveryReciptData } : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();

  const tableData = deliveryReciptData .map((item : DeliveryReciptData) => {
    return {
      id: item.id,
      deliveryReciptNumber: item.deliveryReciptNumber,
      dateIssued: item.dateIssued.substring(10, 0),
      medRep: item.pmr?.employeeInfo.firstName + " " + item.pmr?.employeeInfo.lastName,
      preparedBy: item.preparedBy?.employeeInfo.firstName + " " + item.preparedBy?.employeeInfo.lastName,
      totalAmount: <Header as={'h5'}>{parseFloat(item.totalAmount.toString()).toLocaleString()}</Header>,
      remarks: item.remarks,
      actions: <Button onClick={() => {router.push(`http://localhost:3000/sales/info/deliveryRecipt/${item.id}`)}} color='blue' >View</Button>
    
  }})

  

  return (
   session.data && 
    <div>
      <Inav firstName={post.employeeInfo.firstName}/>
      <div className='tw-w-full tw-h-[80vh] tw-flex tw-flex-col'>
            <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-20 tw-ml-20 tw-mb-10'>Delivery Recipt List</h1>
            <div className='tw-w-full tw-flex tw-justify-center'>
              <div className='tw-w-[90%]'>
                  <Itable data={tableData} headerTitles={headerTitles}/>
              </div>
            </div>
      </div>
      <div className='tw-ml-4 tw-mb-4'>
        <Button onClick={() => {router.push('/sales/add/deliveryRecipt')}}color='blue'>Add Delivery Recipt</Button>
      </div>
    </div>
  )
}
