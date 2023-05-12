import axios from 'axios'
import _, { floor, uniqueId } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import IFlexTable from '../../../../../components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Dropdown, Form, FormField, Header, Input, Label, Message, Radio, TextArea } from 'semantic-ui-react'
import { Client, ClientInfo, EmployeeInfo, Item, ItemInfo, ItemPrice, ItemSalesDetails, Option, UNITS } from '../../../../../types'

import { getPrice, showAvailableUnits, handleUndefined, removeDuplicates ,find, getDate, makeOptions, handleOnChange, handleOptionsChange, handleDateChange, findMany, emptyOptions, emptySalesItemData, quantityOptions, hasEmptyFields, emptyItemData, getTotal, HOSTADDRESS, PORT, formatDateString } from '../../../../../functions'

const tableHeaders = ["id","Quanity", "Unit", "Item Name","Batch No.", "Vatable", "Manufacturing Date", "Expiration Date"]


export const getServerSideProps : GetServerSideProps = async (context) => {
  
    const session = await getSession(context);
    const preparedBy = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)


    return {
      props : { preparedBy: preparedBy.data.data}
    }
}


export default function item({ preparedBy} : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const [emptyFieldsError, setEmptyFieldError] = useState(false)
  const [itemArray, setItemArray] = useState<any>([])
  const [rawData, setRawData] = useState<any>({
    receivingReportNumber : "",
    supplier : "",
    TIN : "",
    dateIssued : "",
    address : "",
    remarks : "",
    term :0,
    items : []

  })
  const [itemData, setItemData] = useState<any>({
    id : "",
    itemName : "",
    batchNumber : "",
    VAT : false,
    expirationDate : "",
    manufacturingDate : "",
    unit : "",
    quantity : 0,
  });
  const [tableData, setTableData] = useState<any>([])
  const [isVAT, setIsVAT] = useState(false);


  useEffect(() => {
    setEmptyFieldError(false);
    setItemData({...itemData, id : uuidv4()})
  }, [rawData, itemData.itemName])

  useEffect(() => {
    setItemData({
      ...itemData,
      VAT : isVAT
    })
  }, [isVAT])



  useEffect(() => {
    setRawData({...rawData, items : itemArray})
    setTableData(itemArray.map((item : any) => {
      return {
        id: item.id,
        quantity : item.quantity, 
        unit : item.unit,
        itemName : item.itemName,
        batchNumber : item.batchNumber,
        VAT : item.VAT ? "Yes" : "No",
        manufacturingDate : formatDateString(item.manufacturingDate.toString()),
        expirationDate : formatDateString(item.expirationDate.toString()),
      }
    }))
  }, [itemArray])


  function handleAddItem(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault()

    if(hasEmptyFields(itemData)){
      setEmptyFieldError(true);
      alert("There are empty Fields")
      return;
    }

    setItemArray((prevArray : any) => [...prevArray, itemData])
  }

  async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault()

    if(hasEmptyFields(rawData, ['remarks', 'items'])){
      setEmptyFieldError(true);
      alert("There are empty Fields")
      console.log(rawData)
      return;
    }

    try{
      await axios.post(`http://${HOSTADDRESS}:${PORT}/api/inventory/receivingReport/add`, rawData)
      
    }catch(error){
      console.log(error)
    }
  }


 function handleDelete(data : any){
  const target = itemArray.find((item : any) => {
    return item.id === data.id
 })

  setItemArray((prevItem : any)=> {return prevItem.filter((value : any) => {return value.id !== target.id} )})
   
 }



    
  return (
    <div className='tw-h-screen tw-w-full'>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%] tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[50%] tw-h-full tw-pl-4 tw-rounded-tl-lg tw-rounded-tr-lg'>
            <Form>
              <Form.Field>
                <h1 className='tw-font-bold tw-text-2xl'>Receiving Report</h1>
              </Form.Field>
              <Form.Group>
                  <Form.Field required error={(emptyFieldsError && rawData.salesInvoiceNumber === '')}>
                      <label htmlFor="receivingReportNumber">Recieving Report #</label>
                      <Input size='mini' id="receivingReportNumber" placeholder="ie. 89901" onChange={(e) => {handleOnChange(e, rawData, setRawData)}} />
                  </Form.Field>
                  <Form.Field required error={(emptyFieldsError && rawData.dateIssued === '')}>
                      <label htmlFor="dateIssued">Date Issued</label>
                      <Input size='mini' type='date' max={getDate()} id="dateIssued" onChange={(e) =>  {handleDateChange(e, rawData, setRawData)}}/>
                  </Form.Field>
              </Form.Group>
              <Form.Group >
              <Form.Field width={10} required error={(emptyFieldsError && rawData.salesInvoiceNumber === '')}>
                      <label htmlFor="supplier">Supplier</label>
                      <Input id="supplier" placeholder="--Supplier Name--" onChange={(e) => {handleOnChange(e, rawData, setRawData)}} />
                  </Form.Field>
                  <Form.Field>
                      <label htmlFor="TIN">TIN</label>
                      <Input id="TIN" onChange={(e) => {handleOnChange(e, rawData, setRawData)}}/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field width={10}>
                      <label htmlFor="address" >Address</label>
                      <TextArea id="address" onChange={(e, item) => {setRawData({...rawData, address : item.value})}} />
                  </Form.Field>
                  <Form.Field width={4} required error={(emptyFieldsError && rawData.term === 0)}>
                    <label htmlFor="term">Terms</label>
                    <Input  id="term" onChange={(e) => {handleOnChange(e, rawData, setRawData)}} type='number' min="0" label={{content : "Days", color : "blue"}} labelPosition='right'/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field>
                      <label htmlFor="remarks">Remarks</label>
                      <Input id="remarks" placeholder="Remarks" onChange={(e) => {handleOnChange(e, rawData, setRawData)}} />
                  </Form.Field>
              </Form.Group>
            </Form>
            </div>
            <div className='tw-w-[50%] tw-pl-4 tw-h-full'>
                <Form>
                    <Form.Field>
                        <h3 className='tw-font-bold tw-text-xl'>Add Item</h3>
                      </Form.Field>
                      <Form.Group>
                            <Form.Field required error={(emptyFieldsError && rawData.salesInvoiceNumber === '')}>
                            <label htmlFor="itemName">Item Name</label>
                            <Input id="itemName" placeholder="--Item Name--" onChange={(e) => {handleOnChange(e, itemData, setItemData)}} />
                        </Form.Field>
                        <Form.Field required error={(emptyFieldsError && itemData.ItemInfo?.batchNumber === '')}>
                            <label htmlFor="batchNumber">Batch Number</label>
                            <Input id="batchNumber" placeholder="--Batch Number--" onChange={(e) => {handleOnChange(e, itemData, setItemData)}} />                          
                        </Form.Field>
                      </Form.Group>
                      <Form.Group>
                        <Form.Field >
                              <label htmlFor="manufacturingDate">Manufacturing Date</label>
                              <Input id="manufacturingDate" type='date' onChange={(e) => handleDateChange(e, itemData, setItemData)}/>
                          </Form.Field>
                          <Form.Field >
                              <label htmlFor="ExpirationDate">Expiration Date</label>
                              <Input id="expirationDate" type='date' onChange={(e) => handleDateChange(e, itemData, setItemData)}/>
                          </Form.Field>  
                      </Form.Group>
                      <Form.Group>
                        <Form.Field>
                              <label htmlFor="VAT">VAT?</label>
                              <Checkbox toggle id={"VAT"} onChange={() => {setIsVAT( isVAT ? false : true)}}/>
                          </Form.Field>
                          <Form.Field required error={(emptyFieldsError && itemData.quantity === 0)}>
                              <label htmlFor="quantity">Quantity</label>
                              <Input value={handleUndefined(itemData.quantity)} id='quantity' onChange={(e) => {handleOnChange(e, itemData, setItemData)}} min="0" type="number" label={{content : <Dropdown color='blue' options={quantityOptions} onChange={(e, item) => {handleOptionsChange(e, item, itemData, setItemData)}}/>, color : "blue"}} labelPosition='right'/>
                          </Form.Field>
                      </Form.Group>
                      <Form.Group>
                        <Button color='blue' onClick={handleAddItem}>Add Item</Button>
                      </Form.Group>
                    </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-flex-col tw-pb-52 tw-items-center'>
          <div className='tw-w-[90%] '>
            <IFlexTable color='blue' data={tableData} updateItem={handleDelete} headerTitles={tableHeaders} allowDelete={true} otherDiscount={0}/>
          </div>
          <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
            <div className='tw-w-[90%]'>
              {tableData.length > 0 ? <Button onClick={handleOnClick} color='blue'>Create Sales Invoice</Button> : null}  
          </div>
        </div>
      </div>
    </div>
  )

  
}


