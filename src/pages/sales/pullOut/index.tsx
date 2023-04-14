import axios from 'axios'
import IFooter from 'components/IFooter'
import ISideCard from 'components/ISideCard'
import Inav from 'components/Inav'
import Itable from 'components/Itable'
import { HOSTADDRESS, PORT } from 'functions'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Button, Header } from 'semantic-ui-react'
import { SalesInvoiceData } from 'types'

const tableData = [
  { id: 1, name: 'John', age: 15, gender: 'Male' },
  { id: 1, name: 'Amber', age: 40, gender: 'Female' },
  { id: 1, name: 'Leslie', age: 25, gender: 'Other' },
  { id: 1, name: 'Ben', age: 70, gender: 'Male' },
]



const headerTitles = ["id", "PO #", "Date Issued", "Client", "Status", "Actions"]

export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

  const pullOutData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/pullOut`)
  
  return {
    props : { post : res.data.data, pullOutData : pullOutData.data.data }
  }
  
}

export default function index({ post , pullOutData} : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();

  console.log(pullOutData)

  const tableData = pullOutData.map((item : any) => {
    return {
        id : item.id,
        pullOutNumber : item.pullOutNumber,
        dateIssued : item.dateIssued.substring(10,0),
        client : item.client.companyName,
        status : item.status,
        actions : <Button color='blue' onClick={() => {router.push(`/sales/pullOut/form/view/${item.pullOutNumber}`)}} >View</Button>

  }})

 
  return (
   session.data && 
    <div>
      <Inav firstName={post.employeeInfo.firstName}/>
      <div className='tw-w-full tw-pb-60 tw-flex tw-flex-col'>
            <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-20 tw-ml-20 tw-mb-20'>Pull Out List</h1>
            <div className='tw-w-full tw-flex tw-justify-center'>
              <div className='tw-w-[90%]'>
                  <Itable data={tableData} headerTitles={headerTitles}/>
              </div>
            </div>
            <div className='tw-ml-20 tw-mt-4'>
              <Button onClick={() => {router.push('/sales/pullOut/form')}}color='blue'>Add Pull Out</Button>
            </div>
      </div>
      
    </div>
  )
}
