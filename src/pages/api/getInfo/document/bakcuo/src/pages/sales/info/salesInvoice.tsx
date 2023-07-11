import axios from 'axios'
import IFooter from 'components/IFooter'
import ISideCard from 'components/ISideCard'
import Inav from 'components/Inav'
import Itable from 'components/IFlexTable'
import { HOSTADDRESS, PORT } from 'functions'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Header, Input } from 'semantic-ui-react'
import { SalesInvoiceData } from 'types'

const tableData = [
  { id: 1, name: 'John', age: 15, gender: 'Male' },
  { id: 1, name: 'Amber', age: 40, gender: 'Female' },
  { id: 1, name: 'Leslie', age: 25, gender: 'Other' },
  { id: 1, name: 'Ben', age: 70, gender: 'Male' },
]



const headerTitles = ["id", "SI #", "Date Issued", "Client", "Prepared By", "Total Amount", "Remarks", "Actions"]

export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

  const salesInvoiceData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/view`)
  
  return {
    props : { post : res.data.data, salesInvoiceData : salesInvoiceData.data.data }
  }
  
}

export default function index({ post , salesInvoiceData} : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();

  const [rawData, setRawData] = useState<any>(salesInvoiceData)
  const [tableData, setTableData] = useState<any>([])

  useEffect(() => {

      
      const data = rawData.map((item : any) => {
        return {
          id: item.id,
          salesInvoiceNumber: item.salesInvoiceNumber,
          dateIssued: item.dateIssued.substring(10, 0),
          client : item.client !== null ? item.client.clientInfo.companyName : "-",
          preparedBy: item.preparedBy?.employeeInfo.firstName + " " + item.preparedBy?.employeeInfo.lastName,
          totalAmount: <Header as={'h5'}>{parseFloat(item.totalAmount.toString()).toLocaleString()}</Header>,
          remarks: item.remarks,
          actions: <Button onClick={() => {router.push(`http://${HOSTADDRESS}:${PORT}/sales/info/${item.id}`)}} color='blue' >View</Button>
        
      }})

      setTableData(data)
  },[rawData])


  function filterData(str : string, array : Array<any>){
      const arr = array.filter((item) => {
	console.log(item)
        return item.salesInvoiceNumber.includes(str) || item.client.clientInfo.companyName.includes(str)
      })
      setRawData(arr)
  }

 

 
  return (
   session.data && 
    <div>
      <Inav/>
      <div className='tw-w-full tw-pb-60 tw-flex tw-flex-col'>
            <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-20 tw-ml-20 tw-mb-20'>Sales Invoice List</h1>
            <div className='tw-ml-16 tw-mb-4'>
              <Button onClick={() => {router.push('/sales/add/invoice')}}color='blue'>Add Sales Invoice</Button>
              <Input onChange={(e) => {filterData(e.target.value, salesInvoiceData)}} type='text' placeholder='Search...' icon={'search'}/>

            </div>
            <div className='tw-w-full tw-flex tw-justify-center'>
              <div className='tw-w-[90%]'>
                  <Itable data={tableData} headerTitles={headerTitles}/>
              </div>
            </div>
      </div>
    </div>
  )
}
