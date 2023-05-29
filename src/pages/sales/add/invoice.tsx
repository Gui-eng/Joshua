import axios from 'axios'
import _, { floor, uniqueId } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import IFlexTable from '../../../../components/InvoiceTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Dropdown, Form, FormField, Header, Input, Label, Message, TextArea } from 'semantic-ui-react'
import { Client, ClientInfo, EmployeeInfo, Item, ItemInfo, ItemPrice, ItemSalesDetails, Option, SalesInvoiceData, UNITS } from '../../../../types'

import { getPrice, showAvailableUnits, handleUndefined, removeDuplicates ,find, getDate, makeOptions, handleOnChange, handleOptionsChange, handleDateChange, findMany, emptyOptions, emptySalesInvoiceData, emptySalesItemData, quantityOptions, hasEmptyFields, emptyItemData, getTotal, HOSTADDRESS, PORT, formatCurrency } from '../../../../functions'

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

  //Option Change
  const [itemNameValue, setItemNameValue] = useState<string>('');
  const [batchNumberValue, setBatchNumberValue] = useState<string>('');
  const [companyNameValue, setCompanyNameValue] = useState<string>('');


  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/client/${companyNameValue}`)
      const companyInfoData = res.data.data.length === undefined ? res.data.data : { id : '', pmrId : ''}

      setSalesInvoiceData({...salesInvoiceData,pmrEmployeeId : companyInfoData.pmrId, client : companyInfoData, clientId : companyInfoData.id, preparedById : preparedBy.employeeInfo.id})
    }

    fetchData()
  }, [companyNameValue])
  
  //Item Name and Batch Options
  useEffect(() => {
    const fetchData = async () => {
      const batchItemArray = await findMany("itemName", itemInfo, itemNameValue);
      setFilteredItemList(batchItemArray);
      setItemData(emptySalesItemData)
    };
  
    fetchData();
    setDisabled(true);
  }, [itemNameValue]);
  
  useEffect(() => {
    const batchOption = makeOptions(filteredItemList || [], 'id', ['batchNumber']);
    setBatchOption(batchOption);
  }, [filteredItemList]);

 
  useEffect(() => {
    const getItemData = async () => {
      const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item/getItem/${batchNumberValue}`)
      const resData = res.data.data
      const newId = uuidv4()

      setItemData(prevItemData => ({
        ...prevItemData,
        id : newId,
        itemInfoId: batchNumberValue,
        ItemInfo: {
          id : resData.id,
          batchNumber: resData.batchNumber,
          expirationDate: resData.expirationDate,
          manufacturingDate: resData.manufacturingDate,
          itemName: resData.itemName,
          VAT: resData.VAT,
          ItemPrice: resData.ItemPrice
        },
        unitPrice : getPrice(resData.ItemPrice, itemData.unit) || 0,
        vatable : resData.VAT
        
      }));

      showAvailableUnits(resData.ItemPrice, setAvailableQuantityOption)
    }
    
    if(batchNumberValue !== ''){
     getItemData()
     setDisabled(false);
    }
  }, [batchNumberValue])

  console.log(salesInvoiceData)

  useEffect(() => {
    setSalesInvoiceData({...salesInvoiceData, isRemote : isRemote})
  }, [isRemote])

  //Setting Table Data and Items in the Sales invoice Data
  useEffect(() => {
    const tableDataSales = itemArray.map((item : Item) => {
      const discount = handleUndefined(item.discount) / 100
      const grossAmount = item.totalAmount
      const netAmount = grossAmount - (grossAmount * discount)
      const VATAmount = netAmount / 1.12 * 0.12

      const data = {
        itemId :  handleUndefined(item.id),
        grossAmount :  Math.round(grossAmount  * 100) / 100 ,
        discount : discount || 0,
        netAmount : Math.round(netAmount * 100) / 100,
        VATAmount : item.vatable ? Math.round(VATAmount * 100) / 100 : 0, 
        vatable : item.vatable,
      }

      return data
    })

    setSales(tableDataSales)

    const tableDataItems = itemArray.map((item : Item) => {
      const discount = handleUndefined(item.discount) / 100
      const grossAmount = item.totalAmount
      const netAmount = grossAmount - (grossAmount * discount)

      return {
        id : item.id,
        quantity : item.quantity,
        unit : item.unit,
        article : item.ItemInfo?.itemName,
        batchNumber : item.ItemInfo?.batchNumber,
        VAT : item.vatable ? <Header color='green' as='h5'>Yes</Header> : <Header color='red' as='h5'>No</Header>,
        unitPrice : item.unitPrice.toLocaleString(),
        discount : handleUndefined(item.discount) + "%",
        totalAmount : formatCurrency(netAmount.toString()),
      }
    })

    setTableData(tableDataItems)
    setSalesInvoiceData({...salesInvoiceData, item : itemArray})
  }, [itemArray])



  //Getting the Unit Price
  useEffect(() => {
    const getUnitPrice = getPrice(handleUndefined(itemData.ItemInfo?.ItemPrice), itemData.unit) || 0

    if(getUnitPrice > 0) {
      const getTotalGrossAmount = getUnitPrice * itemData.quantity
      setItemData({...itemData, unitPrice : getUnitPrice, totalAmount : getTotalGrossAmount})

    }else{
      setItemData({...itemData, unitPrice : getUnitPrice})
    }
  }, [itemData.unit, itemData.quantity])

  //Data Handling

  async function handleAddItem(){
    if(hasEmptyFields(itemData, ['discount'])){
      alert('There are empty Fields')
      setEmptyFieldError(true)
      return
    }
  
    const newId = uuidv4()
    setItemData({...itemData, id: newId})

    setItemArray(prevItemArray => [...prevItemArray, itemData])
  }


  async function handleOnClick(){
    if(hasEmptyFields(salesInvoiceData, ['remarks', 'nonVATSales', 'VATableSales', 'VAT', 'totalAmount'])){
      setEmptyFieldError(true)
      alert('There are Empty Fields')
      return
    }


      const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/sales/addInvoice`, salesInvoiceData)
      router.reload()
    if(!res.status){
      console.log(res.statusText)
    }

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
        <div className='tw-w-[90%] tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[50%] tw-h-full tw-pl-4 tw-rounded-tl-lg tw-rounded-tr-lg'>
            <Form>
              <Form.Field>
                <h1 className='tw-font-bold tw-text-2xl'>Sales Invoice</h1>
              </Form.Field>
              <Form.Group>
                  <Form.Field required error={(emptyFieldsError && salesInvoiceData.salesInvoiceNumber === '')}>
                      <label htmlFor="salesInvoiceNumber">SI No.</label>
                      <Input size='mini' id="salesInvoiceNumber" placeholder="ie. 89901" onChange={(e) => {handleOnChange(e, salesInvoiceData, setSalesInvoiceData)}} />
                  </Form.Field>
                  <Form.Field required error={(emptyFieldsError && salesInvoiceData.dateIssued === '')}>
                      <label htmlFor="dateIssued">Date Issued</label>
                      <Input size='mini' type='date' max={getDate()} id="dateIssued" onChange={(e) =>  {handleDateChange(e, salesInvoiceData, setSalesInvoiceData)}}/>
                  </Form.Field>
              </Form.Group>
              <Form.Group >
                <Form.Field width={10} required error={(emptyFieldsError && salesInvoiceData.clientId === '')} >
                      <label htmlFor="companyName">Company Name</label>
                      <Dropdown
                          placeholder='--Company Name--'
                          search
                          selection
                          options={clientOptions}
                          onChange={(e, item) => { setCompanyNameValue(item.value?.toString() || '')}}
                      />
                  </Form.Field>
                  <Form.Field>
                      <label htmlFor="TIN">TIN</label>
                      <Input  id="TIN" value={handleUndefined(salesInvoiceData.client?.TIN)} readOnly/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field width={10}>
                      <label htmlFor="address" >Address</label>
                      <TextArea id="address" value={handleUndefined(salesInvoiceData.client?.address)} readOnly/>
                  </Form.Field>
                  <Form.Field width={4} required error={(emptyFieldsError && salesInvoiceData.term === 0)}>
                    <label htmlFor="term">Terms</label>
                    <Input  id="term"  onChange={(e) => {handleOnChange(e, salesInvoiceData, setSalesInvoiceData)}} type='number' min="0" label={{content : "Days", color : "blue"}} labelPosition='right'/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                <Form.Field width={8} required error={(emptyFieldsError && salesInvoiceData.pmrEmployeeId === '')}>
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
                  <Form.Field>
                      <label htmlFor="remarks">Remarks</label>
                      <Input id="remarks" placeholder="Remarks" onChange={(e) => {handleOnChange(e, salesInvoiceData, setSalesInvoiceData)}} />
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field className={`tw-items-center tw-flex tw-flex-col ${!isRemote ? 'tw-py-2' : 'tw-py-4'}`}>
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
                            onChange={(e, item) => { setItemNameValue(item.value?.toString() || '')}}
                            />
                        </Form.Field>
                        <Form.Field required error={(emptyFieldsError && itemData.ItemInfo?.batchNumber === '')}>
                            <label htmlFor="BatchNumner">Batch Number</label>
                            <Dropdown
                            id="batchNumber"
                            disabled={itemNameValue === ''}
                            search
                            selection
                            options={batchOption}
                            onChange={(e, item) => { setBatchNumberValue(item.value?.toString() || '')}}
                            />
                        </Form.Field>
                      </Form.Group>
                      <Form.Group>
                        <Form.Field disabled={disabled}>
                              <label htmlFor="manufacturingDate">Manufacturing Date</label>
                              <Input id="manufacturingDate" type='date' value={itemData.ItemInfo?.manufacturingDate.toString().substring(10,0) || ''} readOnly/>
                          </Form.Field>
                          <Form.Field disabled={disabled}>
                              <label htmlFor="ExpirationDate">Expiration Date</label>
                              <Input id="ExpirationDate" type='date' value={itemData.ItemInfo?.expirationDate.toString().substring(10,0) || ''} readOnly/>
                          </Form.Field>  
                      </Form.Group>
                      <Form.Group>
                        <Form.Field disabled={disabled}>
                              <label htmlFor="quantity">VAT?</label>
                              <Input value={itemData.ItemInfo?.VAT ? 'Yes' : 'No' || ''} readOnly/>
                          </Form.Field>
                          <Form.Field disabled={disabled} required error={(emptyFieldsError && itemData.quantity === 0)}>
                              <label htmlFor="quantity">Quantity</label>
                              <Input min={1} value={handleUndefined(itemData.quantity)} id='quantity' onChange={(e) => { handleOnChange(e, itemData, setItemData)}} type="number" label={{content : <Dropdown color='blue' value={itemData.unit} options={availableQuantityOptions} onChange={(e, item) => {handleOptionsChange(e, item, itemData, setItemData)}}/>, color : "blue"}} labelPosition='right'/>
                          </Form.Field>
                      </Form.Group>
                      <Form.Group>
                        <Form.Field disabled={disabled}>
                            <label htmlFor="discount">Discount</label>
                            <Input  value={itemData.discount} onChange={(e) => {handleOnChange(e, itemData, setItemData)}}  max={100.00} id="discount" min={0.00} step=".01" type='number' label={{icon: "percent", color : "blue"}} labelPosition='right'/>
                        </Form.Field>
                        <Button color='blue' onClick={handleAddItem}>Add Item</Button>
                      </Form.Group>
                    </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-flex-col tw-pb-52 tw-items-center'>
          <div className='tw-w-[90%] '>
            <IFlexTable color='blue' data={tableData} updateItem={handleDelete} headerTitles={tableHeaders} extraData={sales} allowDelete={true} otherDiscount={0}/>
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


