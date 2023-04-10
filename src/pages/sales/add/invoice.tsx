import axios from 'axios'
import _, { floor, uniqueId } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import IFlexTable from '../../../../components/InvoiceTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Dropdown, Form, FormField, Header, Input, Label, Message } from 'semantic-ui-react'
import { Client, ClientInfo, EmployeeInfo, Item, ItemInfo, ItemPrice, ItemSalesDetails, Option, SalesInvoiceData, UNITS } from '../../../../types'

import { getPrice, showAvailableUnits, handleUndefined, removeDuplicates ,find, getDate, makeOptions, handleOnChange, handleOptionsChange, handleDateChange, findMany, emptyOptions, emptySalesInvoiceData, emptySalesItemData, quantityOptions, hasEmptyFields, emptyItemData, getTotal } from '../../../../functions'

const tableHeaders = ["id","Quanity", "Unit", "Articles","Batch No.", "Vatable", "U-Price", "Discount", "Amount"]


export const getServerSideProps : GetServerSideProps = async (context) => {
  
    const session = await getSession(context);
    const client = await axios.get("http://localhost:3000/api/getInfo/client")
    const pmr = await axios.get("http://localhost:3000/api/getInfo/employee/pmr")
    const item = await axios.get('http://localhost:3000/api/getInfo/item')
    const preparedBy = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
    

    return {
      props : { preparedBy: preparedBy.data.data, itemInfo : item.data.data, clientInfo : client.data.data, pmrInfo : pmr.data.data}
    }
}


export default function item({ itemInfo, preparedBy, clientInfo, pmrInfo } : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const itemList = removeDuplicates(itemInfo, 'itemName')
  const router = useRouter()

  


  //Options
  const itemOptions : Option[] = makeOptions(itemList, 'itemName', ['itemName'], 'itemName')
  const clientOptions : Option[] = makeOptions(clientInfo, 'clientId', ['companyName'])
  const pmrOptions : Option[] = makeOptions(pmrInfo, 'pmrEmployeeId', ['code', 'firstName', 'lastName']) 
  const [availableQuantityOptions, setAvailableQuantityOption] = useState(quantityOptions)

  //Data
  const [salesInvoiceData, setSalesInvoiceData] = useState(emptySalesInvoiceData)
  const [itemData, setItemData] = useState<Item>(emptySalesItemData)
  const [selectedItemData, setSelectedItemData] = useState<ItemInfo>()
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [tableData, setTableData] = useState<Array<any>>([])
  const [sales, setSales] = useState<Array<ItemSalesDetails>>([])
  const [total, setTotal] = useState({})

  //Temps
  const [batchOption, setBatchOption] = useState<Array<Option>>([emptyOptions])
  const [filteredItemList, setFilteredItemList] = useState<Array<ItemInfo>>()
  const [itemArray, setItemArray] = useState<Array<any>>([])

  //Booleans
  const [isRemote, setIsRemote] = useState(true)
  const [disabled, setDisabled] = useState(true)
  const [disabledStockIn, setDisabledStockIn] = useState(false)
  const [stockIn, setStockIn] = useState(false)
  const [emptyFieldsError, setEmptyFieldError] = useState(false)
   



  function handleDiscount(e : React.ChangeEvent<HTMLInputElement>){
    const discount = parseFloat(e.target.value) / 100
    setItemData({...itemData, discount : discount, itemSalesDetails : {...itemData.itemSalesDetails, discount : discount} })
  }

  function handleQuantity(e : React.ChangeEvent<HTMLInputElement>){
    setItemData({...itemData, quantity : parseFloat(e.target.value)})
  }
  
  useEffect(() => {
    setEmptyFieldError(false)
  }, [salesInvoiceData])

  useEffect(() => {
    setSalesInvoiceData({...salesInvoiceData, isRemote : isRemote})
  }, [isRemote])

  useEffect(() => {
    setBatchOption(makeOptions(filteredItemList !== undefined ? filteredItemList : [], 'id', ['batchNumber']))
    if(selectedItemId !== ''){
      setDisabled(true)
    }
  }, [filteredItemList])

  useEffect(() => {
    setSalesInvoiceData({...salesInvoiceData, stockIn : stockIn})
  }, [stockIn])

  useEffect(() => {
    setSelectedItemData(find(selectedItemId, itemInfo))
    if(selectedItemId !== ''){
      setDisabled(false)
    }
    
  },[selectedItemId])

  useEffect(() => {
    if(salesInvoiceData.clientId !== ''){

      const client : ClientInfo = find(handleUndefined(salesInvoiceData.clientId), clientInfo)
    
      setSalesInvoiceData({...salesInvoiceData, client : find(handleUndefined(salesInvoiceData.clientId), clientInfo), preparedById : preparedBy.employeeInfoId, pmrEmployeeId : client.pmrId})
    }
  }, [salesInvoiceData.clientId])

  useEffect(() => {
    setItemData({...itemData, id : uuidv4(), ItemInfo : selectedItemData, itemInfoId : selectedItemData?.id, vatable : handleUndefined(selectedItemData?.VAT)})
    showAvailableUnits(handleUndefined(selectedItemData?.ItemPrice), setAvailableQuantityOption)
  }, [selectedItemData])

  useEffect(() => {
    setItemData({...itemData, unitPrice : handleUndefined(getPrice(handleUndefined(selectedItemData?.ItemPrice), itemData.unit))})
  }, [itemData.quantity, itemData.unit])
  
 

  useEffect(() => {
    const totalAmount = itemData.unitPrice * itemData.quantity
    const netTotalAmount = totalAmount - (totalAmount * handleUndefined(itemData.discount))
    setItemData({...itemData, totalAmount : totalAmount, itemSalesDetails : { ...itemData.itemSalesDetails,
      grossAmount : itemData.unitPrice * itemData.quantity,
      itemId : handleUndefined(itemData.id),
      netAmount : netTotalAmount,
      vatable : itemData.vatable,
      VATAmount : netTotalAmount - (netTotalAmount * 0.12)
    }})
  }, [itemData.unitPrice, itemData.quantity])


  //temp
  useEffect(() => {

    const tableDataSales = itemArray.map((item : Item) => {
      const VATAmountWithDiscount = Math.round(((item.totalAmount - (item.totalAmount * handleUndefined(item.discount))) * 0.12) * 100) / 100

      const VATAmountWithoutDiscount = Math.round((item.totalAmount * 0.12) * 100) / 100

      const data = {
        itemId : handleUndefined(item.id),
        grossAmount : Math.round(item.totalAmount * 100) / 100,
        discount : handleUndefined(item.discount),
        netAmount : (item.totalAmount - (item.totalAmount * handleUndefined(item.discount))),
        VATAmount : item.vatable ? handleUndefined(item.discount) !== 0 ?  VATAmountWithDiscount : VATAmountWithoutDiscount  : 0,
        vatable : item.vatable,
      }


      return data
    })

    setSales(tableDataSales)

    const tableDataItems = itemArray.map((item : Item) => {
      return {
        id : item.id,
        quantity : item.quantity,
        unit : item.unit,
        article : item.ItemInfo?.itemName,
        batchNumber : item.ItemInfo?.batchNumber,
        VAT : item.vatable ? <Header color='green' as='h5'>Yes</Header> : <Header color='red' as='h5'>No</Header>,
        unitPrice : item.unitPrice.toLocaleString(),
        discount : handleUndefined(item.discount) * 100 + "%",
        totalAmount : (item.totalAmount - (item.totalAmount * handleUndefined(item.discount))).toLocaleString(),
      }
    })

    setTableData(tableDataItems)
    setSalesInvoiceData({...salesInvoiceData, item : itemArray, })
  },[itemArray])

  useEffect(() => {
    setSalesInvoiceData({...salesInvoiceData, totalAmount : _.sumBy(sales, 'netAmount'), VAT : _.sumBy(sales, 'VATAmount'), total : getTotal(sales)})
  }, [sales])


  //Data Handling

  async function handleAddItem(){
    if(hasEmptyFields(itemData, ['discount'])){
      setEmptyFieldError(true)
      return
    }

    const newId = uuidv4()

    setItemData({...itemData, id: newId})

    setItemArray(prevItemArray => [...prevItemArray, itemData])
  }

  async function handleOnClick(){
    if(hasEmptyFields(salesInvoiceData, ['remarks', 'nonVATSales', 'VATableSales'])){
      setEmptyFieldError(true)
      alert('There are Empty Fields')
      return
    }

    console.log(salesInvoiceData.isRemote)

    const res = await axios.post('http://localhost:3000/api/sales/addInvoice', salesInvoiceData)
    
    if(!res.status){
      console.log(res.statusText)
    }

    router.reload()
  }


    
  return (
    <div className='tw-h-screen tw-w-full'>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%]  tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[90%] tw-rounded-tl-lg tw-rounded-tr-lg'>
             <Form>
              <Form.Field>
                <h1 className='tw-font-bold tw-text-2xl'>Sales Invoice</h1>
              </Form.Field>
              <Form.Group>
                  <Form.Field required error={(emptyFieldsError && salesInvoiceData.salesInvoiceNumber === '')}>
                      <label htmlFor="salesInvoiceNumber">SI No.</label>
                      <Input id="salesInvoiceNumber" placeholder="ie. 89901" onChange={(e) => {handleOnChange(e, salesInvoiceData, setSalesInvoiceData)}} />
                  </Form.Field>
                  <Form.Field required error={(emptyFieldsError && salesInvoiceData.clientId === '')} >
                      <label htmlFor="companyName">Company Name</label>
                      <Dropdown
                          placeholder='--Company Name--'
                          search
                          selection
                          options={clientOptions}
                          onChange={(e, item) => {handleOptionsChange(e, item, salesInvoiceData, setSalesInvoiceData)}}
                      />
                  </Form.Field>
                  <Form.Field>
                      <label htmlFor="address" >Address</label>
                      <Input id="address" value={handleUndefined(salesInvoiceData.client?.address)} readOnly/>
                  </Form.Field>
                  <Form.Field>
                      <label htmlFor="TIN">TIN</label>
                      <Input id="TIN" value={handleUndefined(salesInvoiceData.client?.TIN)} readOnly/>
                  </Form.Field>
                  <Form.Field>
                      <label htmlFor="remarks">Remarks</label>
                      <Input id="remarks" placeholder="Remarks" onChange={(e) => {handleOnChange(e, salesInvoiceData, setSalesInvoiceData)}} />
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field required error={(emptyFieldsError && salesInvoiceData.dateIssued === '')}>
                      <label htmlFor="dateIssued">Date Issued</label>
                      <Input type='date' max={getDate()} id="dateIssued" onChange={(e) =>  {handleDateChange(e, salesInvoiceData, setSalesInvoiceData)}}/>
                  </Form.Field>
                  <Form.Field required error={(emptyFieldsError && salesInvoiceData.pmrEmployeeId === '')}>
                      <label htmlFor="PMR">PMR</label>
                      <Dropdown
                        id = "PMR"
                        placeholder='--PMR Code--'
                        search
                        selection
                        wrapSelection
                        value ={salesInvoiceData.pmrEmployeeId}
                        options={pmrOptions}
                        onChange={(e, item) => {handleOptionsChange(e, item, salesInvoiceData, setSalesInvoiceData)}}
                      />
                  </Form.Field>
                  <Form.Field className={`tw-items-center tw-flex tw-flex-col ${!isRemote ? 'tw-py-4' : 'tw-py-8'}`}>
                    {!isRemote ? <p><small><small className='tw-flex'><p className='tw-text-red-600'>*</p>NOTE: Stocks will be deducted from the main inventory</small></small></p> : null}
                    <Checkbox
                  
                  label = {<label>{isRemote? <Header color='grey'>Remote Inventory</Header> : <Header>Main Inventory</Header>}</label>}
                  onChange={() => {setIsRemote(isRemote ? false : true)}}
                  toggle/>
                  </Form.Field>
                  <Form.Field required error={(emptyFieldsError && salesInvoiceData.term === 0)}>
                    <label htmlFor="term">Terms</label>
                    <Input id="term"  onChange={(e) => {handleOnChange(e, salesInvoiceData, setSalesInvoiceData)}} type='number' min="0" label={{content : "Days", color : "blue"}} labelPosition='right'/>
                  </Form.Field>
              </Form.Group>
              <Form.Field>
                <h3 className='tw-font-bold tw-text-xl'>Add Item</h3>
              </Form.Field>
              <Form.Group>
              <Form.Field required error={(emptyFieldsError && itemData.itemInfoId === '')} >
                    <label htmlFor="itemName">Item Name</label>
                    <Dropdown
                    id="itemName"
                    search
                    selection
                    options={itemOptions}
                    onChange={(e, item) => {setFilteredItemList(findMany(e.currentTarget.id, itemInfo, item.value !== undefined ? item.value.toString() : ''))}}
                    />
                </Form.Field>
                <Form.Field required error={(emptyFieldsError && itemData.ItemInfo?.batchNumber === '')}>
                    <label htmlFor="BatchNumner">Batch Number</label>
                    <Dropdown
                    id="batchNumber"
                    disabled={filteredItemList !== undefined ? filteredItemList[0].itemName === '' : true}
                    search
                    selection
                    options={batchOption}
                    onChange={(e, item) => {setSelectedItemId(handleUndefined(item.value))}}
                    />
                </Form.Field>
                <Form.Field disabled={disabled}>
                    <label htmlFor="manufacturingDate">Manufacturing Date</label>
                    <Input id="manufacturingDate" type='date' value={selectedItemId !== '' ? (disabled ? "" : selectedItemData?.manufacturingDate.toString().substring(10, 0)) : ''} readOnly/>
                </Form.Field>
                <Form.Field disabled={disabled}>
                    <label htmlFor="ExpirationDate">Expiration Date</label>
                    <Input id="ExpirationDate" type='date' value={selectedItemId !== '' ? (disabled ? "" : selectedItemData?.expirationDate.toString().substring(10, 0)): ''} readOnly/>
                </Form.Field>  
              </Form.Group>
              <Form.Group>
                <Form.Field disabled={disabled}>
                    <label htmlFor="quantity">VAT?</label>
                    <Input value={salesInvoiceData.id != '' ? (disabled ? "" : (selectedItemData?.VAT ? "Yes" : "No")) : ""} readOnly/>
                </Form.Field>
                <Form.Field disabled={disabled} required error={(emptyFieldsError && itemData.quantity === 0)}>
                    <label htmlFor="quantity">Quantity</label>
                    <Input value={handleUndefined(itemData.quantity)} id='quantity' onChange={(e) => {handleQuantity(e)}} min="0" type="number" label={{content : <Dropdown color='blue' options={availableQuantityOptions} onChange={(e, item) => {handleOptionsChange(e, item, itemData, setItemData)}}/>, color : "blue"}} labelPosition='right'/>
                </Form.Field>
                <Form.Field disabled={disabled}>
                    <label htmlFor="discount">Discount</label>
                    <Input onChange={(e) => { handleDiscount(e) }}  max='100.00' id="discount" min="00.00" step=".01" type='number' label={{icon: "percent", color : "blue"}} labelPosition='right'/>
                </Form.Field>
                <Button color='blue' onClick={handleAddItem}>Add Item</Button>
              </Form.Group>
              
            </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-flex-col tw-pb-52 tw-items-center'>
          <div className='tw-w-[90%] '>
            <IFlexTable color='blue' data={tableData} headerTitles={tableHeaders} extraData={sales} otherDiscount={0}/>
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
