import React, { SVGProps, useEffect, useState } from 'react'
import { useSession, signOut, getSession} from 'next-auth/react'
import { Button, Checkbox, Dropdown, Form, Grid, Header, Input, Label, Search } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Inav from 'components/Inav';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import axios from 'axios';
import IFooter from 'components/IFooter';
import Itable from 'components/IFlexTable';
import { HOSTADDRESS, PORT, formatCurrency, getDate, handleDateChangeToBeChecked } from 'functions';
import { SalesInvoiceData } from 'types';

const Chart = (props : SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48h-32c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48v160c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48v288c0 26.5-21.5 48-48 48h-32c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z" />
  </svg>
)


export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
    
    const paymentInfo = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/collection`)



    return {
      props : { post : res.data.data, paymentInfo : paymentInfo.data.data }
    }
    
}



const headerTitles = ["id", "CR/AR No.","Mode of payment", "Date", "Total Amount", "Remarks"]

export default function home({ post, paymentInfo} :  InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const { data } = useSession();

 

  const [salesIndexData, setSalesIndexData] = useState({
    to : '',
    from : '',
  })


  const [rawData, setRawData] = useState<any>({
    data : [],
    to : '',
    from : '',
    currentDate : '',
  })


  const [tableData, setTableData] = useState([])


  const generateExcel = async () => {
    try {
      const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/collection/print`, rawData)
      alert('File created Successfully!')
      router.reload()
    } catch (error) {
      console.log(error)
    }
  }

  
 
  useEffect(() => {
    if(salesIndexData.to !== '' && salesIndexData.from !== ''){

      const data = paymentInfo.filter((item : any) => {
        const date = new Date(item.dateIssued).getTime()
        const from = new Date(salesIndexData.from).getTime()
        const to = new Date(salesIndexData.to).getTime()
          return date >= from && date <= to
      })

      setRawData({...rawData, data : data, from : salesIndexData.from, to : salesIndexData.to, currentDate : getDate()})

    }

  }, [salesIndexData])


  useEffect(() => {
    const table = rawData.data.map((item : any) => {
      return {
        id : item.id,
        number : item.modeOfPayment === 'CASH' ? '-' : item.checkNumber,
        modeOfPayment : item.modeOfPayment,
        dateIssued : item.dateIssued.substring(10, 0),
        totalAmount : formatCurrency(item.amount.toString()),
        
      }
    })

    setTableData(table)
  }, [rawData.data])



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
                <h1 className='tw-text-xl tw-ml-2 tw-font-bold'>Collection Report</h1>
                <Form className='tw-flex tw-gap-4'>
                  <Form.Field>
                    <label>From</label>
                    <Form.Input max={getDate()}id="from" onChange={(e) => {handleDateChangeToBeChecked(e, salesIndexData, setSalesIndexData)}}type='Date'/>
                  </Form.Field>
                  <Form.Field>
                    <label>To</label>
                    <Form.Input max={getDate()} id="to" onChange={(e) => {handleDateChangeToBeChecked(e, salesIndexData, setSalesIndexData)}} type='Date'/>
                  </Form.Field>
                </Form>
              </div>
              <div className='tw-w-[95%] tw-p-4 tw-h-full'>
                <Itable data={tableData} headerTitles={headerTitles} allowDelete={false} />

                {tableData.length > 0 ? <Button onClick={() => {generateExcel()}}className='tw-mt-4' color='blue'>Generate Excel File</Button> : null}
              </div>
        </div>
      </div>
      <IFooter/>
    </>
  )
}
