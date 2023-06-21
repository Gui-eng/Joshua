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
import { PrismaClient } from '@prisma/client'     



import { v4 as uuidv4 } from 'uuid';

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const { id } = context.query;
    const prisma = new PrismaClient()

     

    const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
    
    const info = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item/stocks/${id}`)

    const pmr = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/employee/pmr/${id}`)

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

    const checkStocks = async () => {
      const pmrData : Array<any>=  info.data.data
      const itemNum = await prisma.itemInfo.count();
      if(itemNum !== pmrData.length){
        if(pmrData.length === 0){
          const items = await prisma.itemInfo.findMany({select : {id : true}});
          const itemIds = items.map((item) => item.id.toString())
          for(let i = 0; i < itemNum; i++){
            await prisma.stocks.create({
              data : {
                capsule : 0,
                bottle : 0,
                box : 0,
                tablet : 0,
                pmrEmployeeId : pmr.data.data.id,
                itemInfoId : itemIds[i],
              } 
            })
          }
        }else{
          const items = await prisma.itemInfo.findMany({select : {id : true}});
          const itemIds = items.map((item) => item.id.toString())
          for (let i = 0; i < itemNum; i++) {
            const existingStock = await prisma.stocks.findFirst({
              where: {
                itemInfoId: itemIds[i],
                pmrEmployeeId: pmr.data.data.id,
              },
            });
      
            if (!existingStock) {
              await prisma.stocks.create({
                data: {
                  capsule: 0,
                  bottle: 0,
                  box: 0,
                  tablet: 0,
                  pmrEmployeeId: pmr.data.data.id,
                  itemInfoId: itemIds[i],
                },
              });
            }
          }
      }
    }
  }

  checkStocks();
    return {
      props : { post : res.data.data, info : Info, pmr : pmr.data.data }
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
    client : pmr.id,
    dateIssued : getDate() + 'T00:00:00Z'
  })

  const checkStatus = (item : any) => {
    if(item.vial || item.bottle || item.box || item.capsule || item.tablet){
      return true
    }else{
      return false
    }
  }
 

  const [tableData, setTableData] = useState<Array<any>>(info.map((item : any) => {
    const { itemInfo } = item 
    return {
        id : item.id,
        itemName : item.itemInfo.itemName,
        batchNumber : item.itemInfo.batchNumber,
        manufacturingDate : item.itemInfo.manufacturingDate.substring(10, 0),
        expirationDate : item.itemInfo.expirationDate.substring(10, 0),
        remainingVial : item.vial,
        remainingBottle : item.bottle,
        remainingBox : item.box,
        remainingCapsule : item.capsule,
        remainingTablet : item.tablet,
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
      remainingVial : item.vial,
      remainingBottle : item.bottle,
      remainingBox : item.box,
      remainingCapsule : item.capsule,
      remainingTablet : item.tablet,
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
      const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/inventory/addStocksMain/pmr`, rawData)
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
                    <h1 className='tw-text-2xl tw-font-bold'>{pmr.firstName + " " + pmr.lastName}</h1>
                </div>
            </div>
            <div className='tw-w-full tw-flex tw-flex-col tw-items-center '>
                <div className='tw-w-[95%] tw-pb-4'>
                    <Form>
                      <Form.Group>
                        <Form.Field>
                          <label htmlFor="ite">Item Name</label>
                          <Dropdown
                            search
                            selection
                            wrapSelection
                            id = "itemName"
                            placeholder='--Item Name--'
                            options={itemOptions}
                            onChange={(e, item) => {setItemNameValue(item.value?.toString() || '')}}
                          />
                        </Form.Field>
                        <Form.Field disabled={disabled}>
                          <label htmlFor="ite">Batch Number</label>
                          <Dropdown
                            search
                            selection
                            wrapSelection
                            id = "batchNumber"
                            placeholder='--Batch Number--'
                            options={batchOptions}
                            onChange={(e, item) => {setBatchNumberValue(item.value?.toString() || '')}}
                          />
                        </Form.Field>
                        <Form.Field disabled={disabled}>
                              <label htmlFor="quantity">Quantity</label>
                              <Input min={1} value={rawData.quantity} id='quantity' onChange={(e) => { handleOnChange(e, rawData, setRawData)}} type="number" label={{content : <Dropdown color='blue' value={rawData.unit} options={availableQuantityOptions} onChange={(e, item) => {handleOptionsChange(e, item, rawData, setRawData)}}/>, color : "blue"}} labelPosition='right'/>
                        </Form.Field>
                        <Form.Field>
                              <label htmlFor="remarks">Remarks</label>
                              <Input value={rawData.remarks} id="remarks" placeholder="Remarks" onChange={(e) => {handleOnChange(e, rawData, setRawData)}} />
                        </Form.Field>
                      </Form.Group>
                      <Form.Field disabled={disabled}>
                              <Button onClick={(e) => {handleOnClick(e)}} color='blue'>Change Stock</Button>
                        </Form.Field>
                    </Form>
                </div>
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
