import axios from 'axios';
import Itable from 'components/Itable';
import IFooter from 'components/IFooter'
import Inav from 'components/Inav'
import { HOSTADDRESS, PORT, findMany, getDate, handleOnChange, handleOptionsChange, hasEmptyFields, makeOptions, showAvailableUnits } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Form, Header, Input, Table } from 'semantic-ui-react';

import { v4 as uuidv4 } from 'uuid';

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)


    const info = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item/stocks/main`)
    const Info = info.data.data.sort((a : any, b : any) => {
      const nameA = a.itemInfo.itemName.toLowerCase();
      const nameB = b.itemInfo.itemName.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    return {
      props : { post : res.data.data, info : Info }
    }
    
}

const checkStatus = (item : any) => {
  if(item.Vial || item.Bottle || item.Box || item.Capsule || item.Tablet){
    return true
  }else{
    return false
  }
}

const headerTitles = ["id","Item Name", "Batch No.", "Man. Date", "Exp. Date", "Vial/s",  "Bottle/s", "Box/es", "Capsule/s", "Tablet/s", "Status"]

export default function index({ post, info, pmr }  : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const [itemOptions, setItemOptions] = useState<any>()
  const [batchOptions, setBatchOptions] = useState<any>()

  const [itemNameValue, setItemNameValue] = useState('')
  const [batchNumberValue, setBatchNumberValue] = useState('')
  const [availableQuantityOptions, setAvailableQuantityOption] = useState()
  const [selectedItemData, setSelectedItemData] = useState<any>()

  const [disabled, setDisabled] = useState(true)

  const [rawData, setRawData] = useState({
    itemInfoId : '',
    quantity : 0,
    unit :'',
    remarks : '',
    cleint : "UNIPHARMA",
    dateIssued : getDate() + 'T00:00:00Z'
  })
 


  const [tableData, setTableData] = useState<Array<any>>(info.map((item : any) => {
    const { itemInfo } = item 
    return {
        id : item.id,
        itemName : item.itemInfo.itemName,
        batchNumber : item.itemInfo.batchNumber,
        manufacturingDate : item.itemInfo.manufacturingDate.substring(10, 0),
        expirationDate : item.itemInfo.expirationDate.substring(10, 0),
        remainingVial : item.Vial,
        remainingBottle : item.Bottle,
        remainingBox : item.Box,
        remainingCapsule : item.Capsule,
        remainingTablet : item.Tablet,
        status : checkStatus(item) ? <Header as={'h5'} color='green'>In Stock</Header> : <Header as={'h5'} color='red'>Out of Stock</Header>
        
    }
}))

const [data, setData] = useState<Array<any>>(info.map((item : any) => {
  const { itemInfo } = item 
  return {
      id : item.id,
      itemName : item.itemInfo.itemName,
      batchNumber : item.itemInfo.batchNumber,
      manufacturingDate : item.itemInfo.manufacturingDate.substring(10, 0),
      expirationDate : item.itemInfo.expirationDate.substring(10, 0),
      remainingVial : item.Vial,
      remainingBottle : item.Bottle,
      remainingBox : item.Box,
      remainingCapsule : item.Capsule,
      remainingTablet : item.Tablet,
      itemInfoId : item.itemInfo.id
  }
}))

  

  useEffect(() => {
    if(data.length > 0){
      setItemOptions(makeOptions(data, 'id', ['itemName'], 'itemName'))
    }
  }, [data])

  useEffect(() => {
    if(itemNameValue !== ''){
       setDisabled(false)
       const batch = findMany("itemName", data, itemNameValue)
       setBatchOptions(makeOptions(batch, 'batchId', ['batchNumber'],'itemInfoId'))
       console.log(batch)
    }else{
      return
    }
  }, [itemNameValue])

  useEffect(() => {
    if(batchNumberValue !== ''){
      const getItemData = async () => {
        const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item/getItem/${batchNumberValue}`)
        const resData = res.data.data
        const newId = uuidv4()
    
        setRawData({...rawData, itemInfoId : resData.id})
        showAvailableUnits(resData.ItemPrice, setAvailableQuantityOption)
      }

      getItemData()
    }else{
      return
    }
  }, [batchNumberValue])

  async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent> ) {
    e.preventDefault()
    if(hasEmptyFields(rawData, ['remarks', 'quantity'])){
      alert('There are empty fields');
      return;
    }

    try {
      const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/inventory/addStocksMain`, rawData)
      router.reload()
    } catch (error) {
      
    }
    
  }

  return (
    <>
    <div className='tw-w-full tw-h-full'>
     <Inav/>
      <div className='tw-w-full tw-flex tw-flex-col tw-mb-[400px]'>
           <div className='tw-w-full tw-flex tw-justify-center tw-my-8'>
                <div className='tw-w-[90%]'>
                    <h1 className='tw-text-2xl tw-font-bold'>Main Stocks</h1>
                </div>
            </div>
            <div className='tw-w-full tw-flex tw-flex-col tw-items-center '>
               
                <div className='tw-w-[95%]'>
                    <Itable headerTitles={headerTitles} data={tableData} />
                </div>
            </div>
      </div>
    </div>
    <IFooter/>
  </>
  )
}
