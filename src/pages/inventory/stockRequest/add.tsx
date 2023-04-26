import axios from 'axios'
import _, { floor, uniqueId } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import Itable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { Router, useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Dropdown, Form, FormField, Header, Input, Label, Message } from 'semantic-ui-react'



import { HOSTADDRESS, PORT, find, findMany, formatDateString, getDate, getPrice, handleDateChange, handleOnChange, handleOptionsChange, handleUndefined, hasEmptyFields, makeOptions, removeDuplicates, showAvailableUnits } from '../../../../functions'
import { Option } from 'types';

const tableHeaders = ["id", "Quantity requested", "Quantity issued", "Product Name", "Batch #","MFG Date.", "EXP Date", "Remarks"]


export const getServerSideProps : GetServerSideProps = async (context) => {
  
    const session = await getSession(context);
    const client = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/client`)
    const pmr = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/employee/pmr`)
    const item = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item`)
    const preparedBy = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

    const documents = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/document/view`)
    

    return {
      props : { itemInfo : item.data.data, preparedBy: preparedBy.data.data, documentData : documents.data.data.flat(), clientData : client.data.data, pmrInfo : pmr.data.data}
    }
}


export default function item({ itemInfo, documentData, clientData, pmrInfo} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    const router = useRouter()

    const items = removeDuplicates(itemInfo, 'itemName');
    const itemOptions : Option[] = makeOptions(items, 'itemName', ['itemName'], 'itemName')
    const pmrOptions = makeOptions(pmrInfo, 'requestedBy', ['code', 'firstName', 'lastName'])
    const [availableQuantityOptions, setAvailableQuantityOptions] = useState([])
    const [batchOption, setBatchOption] = useState<any>([])

    const [quantityRequested, setQuantityRequested] = useState(0)

    const [filteredItemList, setFilteredItemList] = useState<Array<any>>([])
    const [rawData, setRawData] = useState({
        number : '',
        dateIssued : '',
        requestedBy : '',
        items : []
    })
    const [itemArray, setItemArray] = useState<any>([])

    const [itemData, setItemData] = useState({
      itemInfo : {},
      quantityRequested : 0,
      quantityIssued : 0,
      unit : '',
      remarks : ''
    })
   
    const [selectedItem, setSelectedItem] = useState<any>({
    })
    
    const [selectedItemId, setSelectedItemId] = useState<any>('')
    const [tableData, setTableData] = useState<any>([])



    useEffect(() => {
      setRawData({...rawData, items : itemArray})
      setTableData(itemArray.map((item : any) => {
          return {
            id : item.itemInfo.id,
            quantityreq : item.quantityRequested,
            quantityissued : item.quantityIssued,
            name : item.itemInfo.itemName,
            batchNumber : item.itemInfo.batchNumber,
            mfgDate : formatDateString(item.itemInfo.manufacturingDate),
            expDate : formatDateString(item.itemInfo.expirationDate),
            remarks : item.remarks
          }
      }))
    }, [itemArray])

    useEffect(() => {
      setSelectedItem(find(selectedItemId, itemInfo))
    }, [selectedItemId])

    useEffect(() => {
        if(selectedItem){
            showAvailableUnits(handleUndefined(selectedItem.ItemPrice), setAvailableQuantityOptions);
            setItemData({...itemData, itemInfo : selectedItem})
        }
    },[selectedItem])

    useEffect(() => {
        setBatchOption(makeOptions(filteredItemList !== undefined ? filteredItemList : [], 'id', ['batchNumber']))
        if(selectedItemId !== ''){
          setSelectedItemId('')
        }
    }, [filteredItemList])


    function handleAddItem(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
      e.preventDefault()
      if(hasEmptyFields(itemData, ['remarks'])){
        alert('There are Empty Fields');
        return; 
      }

      setItemArray([...itemArray, itemData])
    
    }

    function handleDelete(data : any){
      const target = itemArray.find((item : any) => {
        return item.itemInfo.id === data.id
     })
    
      setItemArray((prevItem : any)=> {return prevItem.filter((value : any) => {return value.id !== target.id} )})
       
     }

     async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault()
        console.log(rawData)
        if(hasEmptyFields(rawData)){
          alert('there are empty fields');
          return;
        }

      
        try {
          const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/inventory/stockRequest/add`, rawData)
          router.reload()

          
        } catch (error) {
          console.log(error)
        }
     }
    

  return (

    <div className='tw-h-screen tw-w-full'>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%]  tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[90%] tw-rounded-tl-lg tw-rounded-tr-lg'>
             <Form>
              <Form.Field>
                <h1 className='tw-font-bold tw-text-2xl'>Stock Request</h1>
              </Form.Field>
              <Form.Field width={4} required>
                    <label>Stock Req #</label>
                    <Input id='number' type='text' onChange={(e) =>{
                        handleOnChange(e, rawData, setRawData)
                    }}/>
              </Form.Field>
              <Form.Group>
                  <Form.Field required >
                      <label htmlFor="pmr">Requested By: </label>
                      <Dropdown
                          placeholder='--PMR--'
                          search
                          selection
                          options={pmrOptions}
                          onChange={(e, item) => {handleOptionsChange(e, item, rawData, setRawData)}}
                      />
                  </Form.Field>      
                  <Form.Field width={4} required>
                    <label>Delivered To Address</label>
                    <Input id='deliveredToAddress' type='text' onChange={(e) =>{
                        handleOnChange(e, rawData, setRawData)
                    }}/>
              </Form.Field>
                  <Form.Field required>
                    <label>Date Issued</label>
                    <Input id='dateIssued' type='Date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}} max={getDate()}/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field>
                      <label>item Name</label>  
                      <Dropdown
                            placeholder='--Item Name--'
                            id="itemName"
                            search
                            selection
                            options={itemOptions}
                            onChange={(e, item) => {setFilteredItemList(findMany(e.currentTarget.id, itemInfo, item.value !== undefined ? item.value.toString() : ''))}}
                        />
                  </Form.Field>
                  <Form.Field>
                    <label htmlFor="BatchNumber">Batch Number</label>
                    <Dropdown
                    id="batchNumber"
                    disabled={filteredItemList.length === 0}
                    search
                    selection
                    options={batchOption}
                    onChange={(e, item) => {setSelectedItemId(handleUndefined(item.value))}}
                    />
                 </Form.Field>
                  <Form.Field width={5} disabled={selectedItemId === ''}>
                    <label>Quantity Requested</label>
                    <Input value={handleUndefined(itemData.quantityRequested)} id='quantityRequested' onChange={(e) => {handleOnChange(e, itemData, setItemData); setQuantityRequested(Number(e.target.value))}} min="0" type="number" label={{content : <Dropdown id="unit" color='blue' options={availableQuantityOptions} value={itemData.unit} onChange={(e, item) => {handleOptionsChange(e, item, itemData, setItemData)}}/>, color : "blue"}} labelPosition='right'/>
                  </Form.Field>
                  <Form.Field width={5} disabled={selectedItemId === ''}>
                    <label>Quantity Issued</label>
                    <Input value={itemData.quantityRequested < handleUndefined(itemData.quantityIssued) ? itemData.quantityRequested : handleUndefined(itemData.quantityIssued)} id='quantityIssued' onChange={(e) => {handleOnChange(e, itemData, setItemData)}} min="0" max={quantityRequested} type="number" label={{content : <Dropdown id="unit" color='blue' options={availableQuantityOptions} value={itemData.unit} onChange={(e, item) => {handleOptionsChange(e, item, itemData, setItemData)}}/>, color : "blue"}} labelPosition='right'/>
                  </Form.Field>
                  <Form.Field width={4} disabled={selectedItemId === ''}>
                    <label>Remarks</label>
                    <Input id='remarks' type='text' onChange={(e) =>{
                        handleOnChange(e, itemData, setItemData)
                    }}/>
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                <Form.Field disabled={selectedItem === undefined}>
                  <Button color='blue'  onClick={(e) => {handleAddItem(e)}}>Add Item</Button>
                </Form.Field>
              </Form.Group>
            </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-flex-col tw-pb-52 tw-items-center'>
          <div className='tw-w-[90%] '>
            <Itable color='blue' data={tableData} updateItem={handleDelete} headerTitles={tableHeaders} allowDelete={true}/>
          </div>
          <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
            <div className='tw-w-[90%]'>
                {itemArray.length > 0 ? <Button color='blue' onClick={handleOnClick}>Submit Stock Request</Button> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
