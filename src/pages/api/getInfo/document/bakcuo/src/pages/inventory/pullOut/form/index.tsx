import axios from 'axios'
import _, { floor, uniqueId } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import Itable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Dropdown, Form, FormField, Header, Input, Label, Message } from 'semantic-ui-react'

enum PULLOUTSTATUS {
  FOR_REPLACEMENT = "FOR REPLACEMENT",
  EXPIRED = "EXPIRED",
  NEAR_EXPIRY = "NEAR EXPIRY"
}

import { HOSTADDRESS, PORT, getDate, getPrice, handleDateChange, handleOnChange, handleOptionsChange, makeOptions } from '../../../../../functions'
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

const tableHeaders = ["id","SI/DR No.","Quanity", "Product Name","MFG Date.", "EXP Date", "Batch #", "Amount", "Remarks"]


export const getServerSideProps : GetServerSideProps = async (context) => {
  
    const session = await getSession(context);
    const client = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/client`)
    const pmr = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/employee/pmr`)
    const item = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item`)
    const preparedBy = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

    const documents = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/document/view`)
    

    return {
      props : { preparedBy: preparedBy.data.data, documentData : documents.data.data.flat(), clientData : client.data.data}
    }
}


export default function item({ itemInfo, documentData, clientData} : InferGetServerSidePropsType<typeof getServerSideProps>) {




  

  const router = useRouter()

const [pullOutData, setPullOutData] = useState<any>({
  client: '',
  number: '',
  itemId:'',
  quantity : 0,
})

const [documentNumberOptions, setDocumentNumberOptions] = useState<any>([])
const [selectedDocument, setSelectedDocument] = useState<any>(null)
const [selectedItem, setSelectedItem] = useState<any>({
  unit :''
})

const [status, setStatus] = useState<any>()

const [unit, setUnit] =useState('')
const [maxItems, setMaxItems] = useState(0)

const [pullOutTableData, setPullOutTableData] = useState<any>([])
const [itemList, setItemList] = useState([])

const [rawData, setRawData] = useState<any>()
const [itemArray, setItemArray] = useState<any>([])


// Options
const clientOptions = makeOptions(clientData, 'client', ['companyName'])
const itemOptions = makeOptions(itemList, 'itemId', ['name'])

useEffect(() => {
  if(pullOutData.client !== '' && pullOutData.number !== ''){
      setPullOutTableData([])



      const filteredData = documentData.filter((item :any) => item.client.clientInfo.id === pullOutData.client).map((item: any)=> {
        return {...item, number : item.salesInvoiceNumber === undefined ? item.deliveryReciptNumber : item.salesInvoiceNumber}
        })
      setDocumentNumberOptions(makeOptions(filteredData, 'number', ['number']))


  }
  else if(pullOutData.client !== ''){
      const filteredData = documentData.filter((item :any) => item.client.clientInfo.id === pullOutData.client).map((item: any)=> {
        return {...item, number : item.salesInvoiceNumber === undefined ? item.deliveryReciptNumber : item.salesInvoiceNumber}
    })
      setDocumentNumberOptions(makeOptions(filteredData, 'number', ['number']))
  }
}, [pullOutData.client])

useEffect(() => {
    if(pullOutData.pullOutNumber){
      setRawData({...rawData, pullOutNumber : pullOutData.pullOutNumber})
    }
},[pullOutData.pullOutNumber])

useEffect(() => {
  setSelectedDocument(documentData.find((item : any) => item.id === pullOutData.number))
}, [pullOutData.number])

useEffect(() => {
  if (selectedDocument) {
    setItemList(selectedDocument.items.map((item : any) => {
      return {
        id : item.id,
        name : item.ItemInfo.itemName,
        batchnumber : item.ItemInfo.batchNumber,
        unit : item.unit,
        quantity : item.quantity,
        price : getPrice(item.ItemInfo.ItemPrice[0], item.unit),
        expdate : item.ItemInfo.expirationDate,
        mfgdate : item.ItemInfo.manufacturingDate
      }
     }))

     setRawData({
      status : status,
      pullOutNumber : pullOutData.pullOutNumber,
      client : selectedDocument.client.clientInfo.companyName,
      clientId : selectedDocument.client.clientInfo.id,
      address : selectedDocument.client.clientInfo.address,
      dateIssued : pullOutData.dateIssued,
      data : []
    })
  
  }
}, [selectedDocument])

useEffect(() => {
  if(pullOutData.dateIssued){
    setRawData({...rawData, dateIssued : pullOutData.dateIssued})
  }
}, [pullOutData.dateIssued])


useEffect(() => {
  setSelectedItem(itemList.find((item : any)=> item.id === pullOutData.itemId))
}, [pullOutData.itemId])

useEffect(() => {
  if(selectedItem){
      setUnit(selectedItem.unit)
      setMaxItems(selectedItem.quantity)
  }
}, [selectedItem])


useEffect(() => {
  console.log(maxItems)
}, [maxItems])

useEffect(() => {
  if(itemArray.length > 0){
    setRawData({...rawData, data : itemArray})
  }
}, [itemArray])

function updateRemarksById(id: string, remarks: string): void {
  const newData = rawData.data.map((dataItem : any) => {
      if (dataItem.id === id) {
        return { ...dataItem, remarks };
      }
      return dataItem;
    });
    
  setRawData({...rawData, data : newData})
}

useEffect(() => {
  if(rawData !== undefined){
    const tableData = rawData.data.map((item : any) => {
      return {
        id : item.id,
        documentNumber : item.documentNumber,
        quantity : item.quantity,
        name : item.name,
        mfgdate : item.mfgdate.substring(10, 0),
        expdate : item.expdate.substring(10, 0),
        batchnumber : item.batchnumber,
        amount : item.amount,
        remarks : <Input type='text' onChange={(e) => {updateRemarksById(item.id, e.target.value)}}/>


      }
    })

    setPullOutTableData(tableData)
  }
}, [rawData])

function handleDelete(data : any){
  const target = itemArray.find((item : any) => {
    return item.id === data.id
 })

  setItemArray((prevItem : any)=> {return prevItem.filter((value : any) => {return value.id !== target.id} )})
 }

useEffect(() => {
  setRawData({...rawData, data : itemArray, totalAmount : _.sumBy(itemArray, 'amount')})
}, [itemArray])

useEffect(() => {
  if(status){
    setRawData({...rawData, status : status})
  }
}, [status])
  
function handleAddItem(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){

 if(selectedItem.unit === ''|| pullOutData.pullOutNumber === undefined || pullOutData.quantity === 0|| status === undefined || pullOutData.dateIssued === undefined){
  alert('there are empty fields')
  return;
 }

 if(itemArray.some((item : any) => { return selectedItem.name === item.name})){
    alert('item already exist')
    return
 }


 setItemArray((prevValue : any) => prevValue.concat({
    id : uuidv4(),
    documentNumber : selectedDocument.salesInvoiceNumber !== undefined ? selectedDocument.salesInvoiceNumber : selectedDocument.deliveryReciptNumber,
    isSI : selectedDocument.salesInvoiceNumber !== undefined ? true : false,
    name : selectedItem.name,
    unit : unit,
    itemId : selectedItem.id,
    mfgdate : selectedItem.mfgdate,
    expdate : selectedItem.expdate,
    batchnumber : selectedItem.batchnumber,
    quantity : pullOutData.quantity,
    amount : pullOutData.quantity * selectedItem.price,
    remarks : '',
 }))

}

async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
  e.preventDefault()

  if(selectedItem.unit === ''|| pullOutData.pullOutNumber === undefined || pullOutData.quantity === 0|| status === undefined || pullOutData.dateIssued === undefined){
    alert('there are empty fields')
    return;
   }

   try {
      const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/pullOut`, rawData)
      console.log(res.status)

      if(res.status === 200){
         router.reload()
      }
      
   } catch (error) {
      console.error(error)
   }

   
   

}
    
  return (
    <div className='tw-h-screen tw-w-full'>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%]  tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[90%] tw-rounded-tl-lg tw-rounded-tr-lg'>
             <Form>
              <Form.Field>
                <h1 className='tw-font-bold tw-text-2xl'>Pull out</h1>
              </Form.Field>
              <Form.Field width={4} required>
                    <label>Pull Out #</label>
                    <Input id='pullOutNumber' type='text' onChange={(e) =>{
                        handleOnChange(e, pullOutData, setPullOutData)
                    }}/>
              </Form.Field>
              <Form.Group>
              <Form.Field required >
                      <label htmlFor="client">Clent Name</label>
                      <Dropdown
                          placeholder='--Client Name--'
                          search
                          selection
                          options={clientOptions}
                          onChange={(e, item) => {handleOptionsChange(e, item, pullOutData, setPullOutData)}}
                      />
                  </Form.Field>
                <Form.Field required >
                      <label htmlFor="number">SI/DR Number</label>
                      <Dropdown
                          placeholder='--SI/DR Number--'
                          search
                          disabled = {documentNumberOptions.length === 0}
                          selection
                          options={documentNumberOptions}
                          onChange={(e, item) => {handleOptionsChange(e, item, pullOutData, setPullOutData)}}
                      />
                  </Form.Field>
                  
                  <Form.Field required>
                    <label>Date Issued</label>
                    <Input id='dateIssued' type='Date' onChange={(e) => {handleDateChange(e, pullOutData, setPullOutData)}} max={getDate()}/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field>
                      <label>item Name</label>  
                      <Dropdown
                            placeholder='--Item Name--'
                            search
                            disabled = {itemList.length === 0 }
                            selection
                            options={itemOptions}
                            onChange={(e, item) => {handleOptionsChange(e, item, pullOutData, setPullOutData)}}
                        />
                  </Form.Field>
                  <Form.Field width={5}>
                      <label>Quantity</label>
                      <Input value={pullOutData.quantity > maxItems ? maxItems : pullOutData.quanity} disabled={!selectedItem} id={'quantity'} onChange={(e) => {handleOnChange(e, pullOutData, setPullOutData)}} min={0} max={maxItems} type='number' labelPosition='right' label={{content : <Header className='tw-text-zinc-50' as={'h6'}>{unit}</Header>,
                    color : 'blue'}}/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field>
                    <Checkbox
                      radio
                      label='Expired'
                      name='checkboxRadioGroup'
                      value={PULLOUTSTATUS.EXPIRED}
                      checked={status === PULLOUTSTATUS.EXPIRED}
                      onChange={(e, data) => setStatus(data.value)}
                    />
                  </Form.Field>
                  <Form.Field>
                  <Checkbox
                      radio
                      label='For Replacement'
                      name='checkboxRadioGroup'
                      value={PULLOUTSTATUS.FOR_REPLACEMENT}
                      checked={status === PULLOUTSTATUS.FOR_REPLACEMENT}
                      onChange={(e, data) => setStatus(data.value)}
                    />
                  </Form.Field>
                  <Form.Field>
                  <Checkbox
                      radio
                      label='Near Expiry'
                      name='checkboxRadioGroup'
                      value={PULLOUTSTATUS.NEAR_EXPIRY}
                      checked={status === PULLOUTSTATUS.NEAR_EXPIRY}
                      onChange={(e, data) => setStatus(data.value)}
                    />
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                <Form.Field>
                  <Button color='blue' disabled ={maxItems === 0 || maxItems === undefined} onClick={(e) => {handleAddItem(e)}}>Add Item</Button>
                </Form.Field>
              </Form.Group>
            </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-flex-col tw-pb-52 tw-items-center'>
          <div className='tw-w-[90%] '>
            <Itable color='blue' data={pullOutTableData} hasFooter={true} extraData={_.sumBy(itemArray, 'amount')} updateItem={handleDelete} headerTitles={tableHeaders} allowDelete={true} otherDiscount={0}/>
          </div>
          <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
            <div className='tw-w-[90%]'>
                {itemArray.length > 0 ? <Button color='blue' onClick={handleOnClick}>Submit Pull Out</Button> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
