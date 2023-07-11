import axios from 'axios'
import IFooter from 'components/IFooter'
import ISideCard from 'components/ISideCard'
import Inav from 'components/Inav'
import Itable from 'components/IFlexTable'
import { HOSTADDRESS, PORT, formatDateString } from 'functions'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Header, Input } from 'semantic-ui-react'
import { SalesInvoiceData } from 'types'


const headerTitles = ["id", "RR #", "Date Issued", "Supplier", "Remarks", "Actions"]

export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

  const receivingReportData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/inventory/receivingReport`)
  return {
    props : { post : res.data.data, receivingReportData : receivingReportData.data.data }
  }
  
}

export default function index({ post , receivingReportData} : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();




  const [rawData, setRawData] = useState<any>(receivingReportData)
  const [tableData, setTableData] = useState<any>([])

  console.log()
  useEffect(() => {


    setTableData(rawData.map((item : any) => {
      return{
        id : item.id,
        number : item.receivingReportNumber,
        dateIssued : formatDateString(item.dateIssued.toString()),
        supplier : item.supplier,
        remarks : item.remarks,
        action : <Button color='blue' onClick={() => {router.push(`/inventory/receivingReport/view/${item.id}`)}}>View</Button>
      }
    }))

  },[rawData])


  function filterData(str : string, array : Array<any>){
      const arr = array.filter((item) => {
        return item.supplier.includes(str) || item.receivingReportNumber.includes(str)
      })
      setRawData(arr)
  }

 

 
  return (
   session.data && 
    <div>
      <Inav/>
      <div className='tw-w-full tw-pb-60 tw-flex tw-flex-col'>
            <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-20 tw-ml-20 tw-mb-20'>Recieving Report List</h1>
            <div className='tw-ml-16 tw-mb-4'>
              <Button onClick={() => {router.push('/inventory/receivingReport/add')}}color='blue'>Add Receiving Report</Button>
              <Input onChange={(e) => {filterData(e.target.value, receivingReportData)}} type='text' placeholder='Search...' icon={'search'}/>

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
