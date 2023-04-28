import React, { SVGProps, useEffect, useState } from 'react'
import { useSession, signOut, getSession} from 'next-auth/react'
import { Button, Checkbox, Dropdown, Grid, Header, Input, Label, Search } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Inav from 'components/Inav';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import axios from 'axios';
import ICard from 'components/ICard';
import IFooter from 'components/IFooter';
import ISideCard from 'components/ISideCard'
import ISidePanel from 'components/ISidePanel';
import Itable from 'components/IFlexTable';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { SalesInvoiceData } from 'types';
import { HOSTADDRESS, PORT, handleUndefined } from 'functions';



export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

    const salesInvoiceData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/view`)
    const deliveryReciptData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/viewDR`)
    
    
    return {
      props : { post : res.data.data, salesInvoiceData : salesInvoiceData.data.data, deliveryReciptData : deliveryReciptData.data.data }
    }
    
}



const headerTitles = ["id", "Client Name", "SI/DR No.", "Date Issued", "Actions" ]



export default function home({ post, salesInvoiceData, deliveryReciptData } :  InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const { data } = useSession();

  const documentData = [...salesInvoiceData, ...deliveryReciptData]

  const [dataArray, setDataArray] = useState(documentData)
  const [tableData, setTableData] = useState<any>([])
  const [isSINumber, setIsSINumber] = useState(false)

  

  function filterData(str : string, array : Array<any>, isSINumber : boolean){
    if(isSINumber){
      const arr = array.filter((item) => {
        return item.salesInvoiceNumber.includes(str)
      })
      setDataArray(arr)
    }else{
      const arr = array.filter((item) => {
        return item.client.clientInfo.companyName.includes(str)
      })
      setDataArray(arr)
    }

    
  }


  useEffect(() => {
    
    const data = dataArray.map((items : any) => {
      return {
          id : items.id,
          clientName : items.client?.clientInfo.companyName,
          documentNumber : items.salesInvoiceNumber !== undefined ? items.salesInvoiceNumber : items.deliveryReciptNumber,
          dateIssued : items.dateIssued.substring(10, 0),
          view : <Button onClick={() => {router.push(`/sales/collection/${items.id}`)}}color='blue'>View</Button>
      }})

      setTableData(data)
  },[dataArray])


  useEffect(() => {
    if(post.employeeInfoId === null){
      router.push('/newUser')
    }
  },[])

  

  return (
    data && 
    <>
      <div className='tw-w-full tw-h-full'>
        <Inav/>
        <div className='tw-w-full tw-flex tw-items-center tw-flex-col tw-pb-96'>
              
              <div className='tw-w-[95%] tw-p-4 tw-flex tw-justify-between tw-h-full tw-items-center' >
                <Header>Collection</Header>
                <div className='tw-flex tw-items-center tw-gap-4'>
                    <Checkbox 
                    className='tw-flex'
                    onChange={(e, item) => {setIsSINumber(handleUndefined(item.checked))}}
                    label={<label><Header>SI/DR Number</Header></label>}
                    />

                    <Input onChange={(e) => {filterData(e.target.value, salesInvoiceData, isSINumber)}} type='text' placeholder='Search...' icon={'search'}/>
                    
                </div>
              </div>
              <div className='tw-w-[95%] tw-p-4 tw-h-full'>
                <Itable data={tableData} headerTitles={headerTitles} allowDelete={false}/>
              </div>
        </div>
      </div>
      <IFooter/>
    </>
  )
}
