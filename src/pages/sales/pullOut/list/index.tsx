import axios from 'axios'
import IFooter from 'components/IFooter'
import ISideCard from 'components/ISideCard'
import Inav from 'components/Inav'
import Itable from 'components/Itable'
import { HOSTADDRESS, PORT } from 'functions'
import { GetServerSideProps } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Button } from 'semantic-ui-react'

const tableData = [
  { id: 1, name: 'John', age: 15, gender: 'Male' },
  { id: 1, name: 'Amber', age: 40, gender: 'Female' },
  { id: 1, name: 'Leslie', age: 25, gender: 'Other' },
  { id: 1, name: 'Ben', age: 70, gender: 'Male' },
]



const headerTitles = ["id", "ID", "Date Issued", "Med Rep", "Prepared By", "Total Amount", "Remarks", "Actions"]

export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

  const siArray = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/view`)
  
  return {
    props : { post : res.data.data, info : siArray.data.data }
  }
  
}

export default function index({ post , info} : any) {

  const router = useRouter()
  const session = useSession();

  
  // useEffect(() => {
  //   if(!session.data){
  //     alert("Invalid Access")
  //     router.push('/')
  //   }  
  // }, [])

  let items = info.map((item : any) => {
    return {
      id : item.id,
      SalesInvoiceId : item.id,
      dateIssued : item.currentDate.substring(10, 0),
      pmr : item.pmr.employee.firstName + " " + item.pmr.employee.lastName,
      preparedBy : item.preparedBy.employee.firstName + " " + item.preparedBy.employee.lastName,
      totalAmount : item.totalAmount,
      remarks : item.remarks,
      actions : <Button color='blue' onClick={() => {router.push(`http://${HOSTADDRESS}:${PORT}/sales/info/${item.id}`)}}>View</Button>
    }
  })
  



  return (
   session.data && 
    <div>
      <Inav firstName={post.employeeInfo.firstName}/>
      <div className='tw-w-full tw-h-[80vh] tw-flex tw-flex-col'>
            <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-20 tw-ml-20 tw-mb-10'>Invoice List</h1>
            <div className='tw-w-full tw-flex tw-justify-center'>
              <div className='tw-w-[90%]'>
                  <Itable data={items} headerTitles={headerTitles}/>
              </div>
            </div>
      </div>
    </div>
  )
}
