import axios from 'axios'
import _, { floor, uniqueId } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import ITable from '../../../../components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Dropdown, Form, FormField, Header, Input, Label, Message, Table, TextArea } from 'semantic-ui-react'
import { Client, ClientInfo, EmployeeInfo, Item, ItemInfo, ItemPrice, ItemSalesDetails, Option, DeliveryReciptData, UNITS } from '../../../../types'

import { getPrice, showAvailableUnits, handleUndefined, removeDuplicates ,find, getDate, makeOptions, handleOnChange, handleOptionsChange, handleDateChange, findMany, emptyOptions, emptyDeliveryRecipt, emptySalesItemData, quantityOptions, hasEmptyFields, emptyItemData, getTotal, HOSTADDRESS, PORT, formatCurrency } from '../../../../functions'

const tableHeaders = ["id","Quanity", "Unit", "Articles","Batch No.", "Vatable", "U-Price", "Discount", "Amount"]


export const getServerSideProps : GetServerSideProps = async (context) => {
  
    const session = await getSession(context);
    const client = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/client`)
    const pmr = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/employee/pmr`)
    const item = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item`)
    const preparedBy = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
    

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
  const [deliveryReciptData, setDeliveryReciptData] = useState(emptyDeliveryRecipt)
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
  const [isBypass, setIsBypass] = useState(false);



  function handleDiscount(e : React.ChangeEvent<HTMLInputElement>){
    const discount = parseFloat(e.target.value) / 100
    setItemData({...itemData, discount : discount, itemSalesDetails : {...itemData.itemSalesDetails, discount : discount} })
  }

  function handleQuantity(e : React.ChangeEvent<HTMLInputElement>){
    setItemData({...itemData, quantity : parseFloat(e.target.value)})
  }
  
  useEffect(() => {
    setEmptyFieldError(false)
  }, [deliveryReciptData])

  useEffect(() => {
    setDeliveryReciptData({...deliveryReciptData, isRemote : isRemote})
  }, [isRemote])

  useEffect(() => {
    setBatchOption(makeOptions(filteredItemList !== undefined ? filteredItemList : [], 'id', ['batchNumber']))
    if(selectedItemId !== ''){
      setDisabled(true)
    }
  }, [filteredItemList])

  useEffect(() => {
    setDeliveryReciptData({...deliveryReciptData, stockIn : stockIn})
  }, [stockIn])

  useEffect(() => {
    setSelectedItemData(find(selectedItemId, itemInfo))
    if(selectedItemId !== ''){
      setDisabled(false)
    }
    
  },[selectedItemId])

  useEffect(() => {
    if(deliveryReciptData.clientId !== ''){

      const client : ClientInfo = find(handleUndefined(deliveryReciptData.clientId), clientInfo)
    
      setDeliveryReciptData({...deliveryReciptData, client : find(handleUndefined(deliveryReciptData.clientId), clientInfo), preparedById : preparedBy.employeeInfoId, pmrEmployeeId : client.pmrId})
    }
  }, [deliveryReciptData.clientId])

  useEffect(() => {
    if (selectedItemData) {
      setItemData({
        ...itemData,
        ItemInfo: selectedItemData,
        itemInfoId: selectedItemData.id,
        vatable: handleUndefined(selectedItemData.VAT)
      });
      showAvailableUnits(handleUndefined(selectedItemData.ItemPrice), setAvailableQuantityOption);
    }
  }, [selectedItemData]);

  useEffect(() => {


    setItemData({
      ...itemData,
      
      unitPrice: handleUndefined(getPrice(handleUndefined(selectedItemData?.ItemPrice), itemData.unit))
    });
    
  }, [itemData.quantity, itemData.unit, itemData.discount]);
  

 

  useEffect(() => {
    const totalAmount = itemData.unitPrice * itemData.quantity
    const netTotalAmount = totalAmount - (totalAmount * handleUndefined(itemData.discount))

    setItemData({...itemData, totalAmount : !isBypass ? netTotalAmount : 0, itemSalesDetails : { ...itemData.itemSalesDetails,
      grossAmount : !isBypass ? itemData.unitPrice * itemData.quantity : 0,
      itemId : handleUndefined(itemData.id),
      netAmount : !isBypass ? netTotalAmount : 0,
      vatable : itemData.vatable,
      VATAmount : !isBypass ? netTotalAmount - ((netTotalAmount / 1.12) * 0.12) : 0
    }})
  }, [itemData.unitPrice, itemData.quantity, itemData.discount, isBypass])



  //temp
  useEffect(() => {

    const tableDataSales = itemArray.map((item : Item) => {
      const VATAmountWithDiscount = Math.round(((item.itemSalesDetails.netAmount - (item.itemSalesDetails.netAmount * handleUndefined(item.discount))) * 0.12) * 100) / 100

      const VATAmountWithoutDiscount = Math.round((item.itemSalesDetails.netAmount  * 0.12) * 100) / 100

      const data = {
        itemId : !isBypass ? handleUndefined(item.id) : 0,
        grossAmount : !isBypass ? Math.round(item.itemSalesDetails.netAmount  * 100) / 100 : 0,
        discount : !isBypass ? handleUndefined(item.discount) : 0,
        netAmount : !isBypass ? (item.itemSalesDetails.netAmount  - (item.itemSalesDetails.netAmount  * handleUndefined(item.discount))) : 0,
        VATAmount : !isBypass ? item.vatable ? handleUndefined(item.discount) !== 0 ?  VATAmountWithDiscount : VATAmountWithoutDiscount  : 0 : 0,
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
        totalAmount : formatCurrency(item.totalAmount.toString()),
      }
    })

    setTableData(tableDataItems)

    const total = {
      totalAmount : !isBypass ? _.sum(itemArray.map((item : any) => item.itemSalesDetails.netAmount)) : 0,
      VAT : !isBypass ? _.sum(itemArray.map((item : any) => item.itemSalesDetails.VATAmount)) : 0,
    }


    setDeliveryReciptData({...deliveryReciptData, item : itemArray, totalAmount : total.totalAmount, VAT : total.VAT })

 
    
  },[itemArray])
  

  useEffect(() => {
    setDeliveryReciptData({...deliveryReciptData, total : getTotal(sales)})
  }, [sales])

  console.log(deliveryReciptData.item)
  //Data Handling

  async function handleAddItem(){
    if(hasEmptyFields(itemData, ['discount']) && !isBypass){
      setEmptyFieldError(true)
      return
    }

    const newId = uuidv4()

    setItemData({...itemData, id: newId})

    setItemArray(prevItemArray => [...prevItemArray, itemData])
  }

  async function handleOnClick(){
    if(hasEmptyFields(deliveryReciptData, ['remarks', 'nonVATSales', 'VATableSales', 'VAT', 'total', 'totalAmount'])){
      console.log(deliveryReciptData)
      setEmptyFieldError(true)
      alert('There are Empty Fields')
      return
    }


    const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/sales/addDR`, deliveryReciptData)
    
    if(!res.status){
      console.log(res.statusText)
    }

    router.reload()
  }


  function handleDelete(data : any){
    const target = itemArray.find((item : any) => {
      return item.id === data.id
   })
  
    setItemArray((prevItem)=> {return prevItem.filter((value) => {return value.id !== target.id} )})
     
   }

    
  return (
    <div className='tw-h-screen tw-w-full'>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%] tw-rounded-tl-lg tw-rounded-tr-lg tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
        <div className='tw-w-[100%] tw-flex tw-h-full tw-pl-4'>
             <div className='tw-w-[50%] '>
             <Form>
              <Form.Field>
                <h1 className='tw-font-bold tw-text-2xl'>Delivery Recipt</h1>
              </Form.Field>
              <Form.Group>
                  <Form.Field required error={(emptyFieldsError && deliveryReciptData.deliveryReciptNumber === '')}>
                      <label htmlFor="deliveryReciptNumber">DR No.</label>
                      <Input size='mini' id="deliveryReciptNumber" placeholder="ie. 89901" onChange={(e) => {handleOnChange(e, deliveryReciptData, setDeliveryReciptData)}} />
                  </Form.Field>
                  <Form.Field required error={(emptyFieldsError && deliveryReciptData.dateIssued === '')}>
                      <label htmlFor="dateIssued">Date Issued</label>
                      <Input size='mini' type='date' max={getDate()} id="dateIssued" onChange={(e) =>  {handleDateChange(e, deliveryReciptData, setDeliveryReciptData)}}/>
                  </Form.Field>
                  <Form.Field width={6}>
                      <label htmlFor="remarks">Remarks</label>
                      <Input size='mini' id="remarks" placeholder="Remarks" onChange={(e) => {handleOnChange(e, deliveryReciptData, setDeliveryReciptData)}} />
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field required error={(emptyFieldsError && deliveryReciptData.clientId === '')} >
                      <label htmlFor="companyName">Company Name</label>
                      <Dropdown
                          placeholder='--Company Name--'
                          search
                          selection
                          options={clientOptions}
                          onChange={(e, item) => {handleOptionsChange(e, item, deliveryReciptData, setDeliveryReciptData)}}
                      />
                  </Form.Field>
                  <Form.Field>
                      <label htmlFor="TIN">TIN</label>
                      <Input id="TIN" value={handleUndefined(deliveryReciptData.client?.TIN)} readOnly/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field width={10}>
                      <label htmlFor="address" >Address</label>
                      <TextArea id="address" value={handleUndefined(deliveryReciptData.client?.address)} readOnly/>
                  </Form.Field>
                  <Form.Field required error={(emptyFieldsError && deliveryReciptData.term === 0)}>
                    <label htmlFor="term">Terms</label>
                    <Input id="term"  onChange={(e) => {handleOnChange(e, deliveryReciptData, setDeliveryReciptData)}} type='number' min="0" label={{content : "Days", color : "blue"}} labelPosition='right'/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field width={8}  required error={(emptyFieldsError && deliveryReciptData.pmrEmployeeId === '')}>
                      <label htmlFor="PMR">PMR</label>
                      <Dropdown
                        id = "PMR"
                        placeholder='--PMR Code--'
                        search
                        selection
                        wrapSelection
                        value ={deliveryReciptData.pmrEmployeeId}
                        options={pmrOptions}
                        onChange={(e, item) => {handleOptionsChange(e, item, deliveryReciptData, setDeliveryReciptData)}}
                      />
                  </Form.Field>
                  
                  <Form.Field className={`tw-items-center tw-flex tw-flex-col ${!isRemote ? 'tw-py-4' : 'tw-py-8'}`}>
                    {!isRemote ? <p><small><small className='tw-flex'><p className='tw-text-red-600'>*</p>NOTE: Stocks will be deducted from the main inventory</small></small></p> : null}
                    <Checkbox
                  
                  label = {<label>{isRemote? <Header color='grey'>Remote Inventory</Header> : <Header>Main Inventory</Header>}</label>}
                  onChange={() => {setIsRemote(isRemote ? false : true)}}
                  toggle/>
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
                      </Form.Group>
                      <Form.Group>
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
                              <Input value={deliveryReciptData.id != '' ? (disabled ? "" : (selectedItemData?.VAT ? "Yes" : "No")) : ""} readOnly/>
                          </Form.Field>
                          <Form.Field disabled={disabled} required error={(emptyFieldsError && itemData.quantity === 0)}>
                              <label htmlFor="quantity">Quantity</label>
                              <Input value={handleUndefined(itemData.quantity)} id='quantity' onChange={(e) => {handleQuantity(e)}} min="0" type="number" label={{content : <Dropdown color='blue' options={availableQuantityOptions} onChange={(e, item) => {handleOptionsChange(e, item, itemData, setItemData)}}/>, color : "blue"}} labelPosition='right'/>
                          </Form.Field>
                      </Form.Group>
                      <Form.Group>
                        <Form.Field>
                          <label htmlFor="byPassAmount">Bypass Amount</label>
                          <Checkbox id="byPassAmount" toggle onChange={() => {setIsBypass(isBypass ? false : true)}}/>
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
      </div>
      <div className='tw-w-screen tw-flex tw-flex-col tw-pb-52 tw-items-center'>
          <div className='tw-w-[90%] '>
            <ITable color='blue' data={tableData} updateItem={handleDelete} allowDelete={true} headerTitles={tableHeaders} hasFooter={true} extraData={deliveryReciptData.totalAmount}/>
            
          </div>
          <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
            <div className='tw-w-[90%]'>
              {tableData.length > 0 ? <Button onClick={handleOnClick} color='blue'>Create Delivery Recipt</Button> : null}  
          </div>
        </div>
      </div>
    </div>
  )
}
