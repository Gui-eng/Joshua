import axios from 'axios'
import Itable from 'components/Itable'
import IFlexTable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import { Button, DropdownProps, Form, Input, Message, Select } from 'semantic-ui-react'
import { ItemInfo, ItemPrice, Option } from '../../../types'
import { HOSTADDRESS, PORT, find, handleDateChange, handleOnChange, handleOptionsChange, hasEmptyFields } from '../../../functions'

const VAT : Option[] = [
  { id : 'VAT', key: 'vat', text: 'Vatable', value: true },
  { id : 'VAT', key: 'nvat', text: 'Vat-Exempt', value: false},

]

function getDate() : string{
  const date = new Date(Date.now())
  const localDate = new Date(date.getTime() +  24 * 60 * 1000).toISOString()

  return localDate.substring(0, 10)
}

const emptyPrice : ItemPrice = {
  bottle : 0,
  box : 0,
  capsule : 0,
  tablet : 0,
  vial : 0,
  itemInfoId : ''
}

const emptyData : ItemInfo = {
  id : '1',
  batchNumber : '',
  expirationDate : '',
  itemName : '',
  manufacturingDate : '',
  VAT : true,
  price : emptyPrice,
}


export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = await getSession(context)
  const items = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item`)
  
  return {
    props : { items : items.data.data, session : JSON.stringify(session)}
  }
}


const headerTitles = ["id", "Item Name", "Batch Number", "Manufacturing Date", "Expiration Date" , "Per Bottle", "Per Vial", "Per Capsule", "Per Tablet", "Per Box", "Vatable?"]

export default function item({ items, session} : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()

  const itemList = items.map((item : any) => {
    const { ItemPrice }  = item
    return {
      id : item.id,
      itemName : item.itemName,
      batchNumber : item.batchNumber,
      manufacturing : item.manufacturingDate.toString().substring(10, 0),
      expiration: item.expirationDate.toString().substring(10, 0),
      bottle : parseFloat(ItemPrice?.bottle) !== 0 ? parseFloat(ItemPrice?.bottle).toLocaleString() : "-",
      vial : parseFloat(ItemPrice?.vial) !== 0 ? parseFloat(ItemPrice?.vial).toLocaleString() : "-",
      capsule : parseFloat(ItemPrice?.capsule) !== 0 ?parseFloat(ItemPrice?.capsule).toLocaleString() : "-",
      tablet : parseFloat(ItemPrice?.tablet) !== 0 ? parseFloat(ItemPrice?.tablet).toLocaleString() : "-",
      box : parseFloat(ItemPrice?.box) !== 0 ? parseFloat(ItemPrice?.box).toLocaleString() : "-",
      vat : item.VAT ? "Yes" : "No"
    }
  })

  const [itemData, setItemData] = useState<ItemInfo>(emptyData)
  const [price, setPrice] = useState<ItemPrice>(emptyPrice)
  const [id, SetId] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [emptyFieldsError, setEmptyFieldError] = useState(false)

  useEffect(() => {
    setItemData({
      ...itemData,
      price : {
        ...price,
        bottle : price.bottle ? parseFloat(price.bottle.toString()) : 0,
        box :  price.box? parseFloat(price.box.toString()) : 0,
        capsule :  price.capsule ? parseFloat(price.capsule.toString()) : 0,
        tablet :  price.tablet ? parseFloat(price.tablet.toString()) : 0,
        vial :  price.vial ? parseFloat(price.vial.toString()) : 0
      }
    })
  }, [price])

  useEffect(() => {
    setEmptyFieldError(false)
  }, [itemData])

  
  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      !session && router.push('/')
    }

    fetchSession();
  }, []);

  
  function updateItem(data : any){
    const itemToUpdate = find(data.id, items)

    SetId(data.id)
    setItemData({
      batchNumber : itemToUpdate.batchNumber,
      expirationDate : itemToUpdate.expirationDate,
      itemName : itemToUpdate.itemName,
      manufacturingDate : itemToUpdate.manufacturingDate,
      VAT : itemToUpdate.VAT,
    })

    setPrice({
      id : itemToUpdate.ItemPrice.id,
      bottle : parseFloat(itemToUpdate.ItemPrice !== undefined ? itemToUpdate.ItemPrice.bottle : '0'),
      box: parseFloat(itemToUpdate.ItemPrice !== undefined ? itemToUpdate.ItemPrice.box : '0'),
      capsule: parseFloat(itemToUpdate.ItemPrice !== undefined ? itemToUpdate.ItemPrice.capsule : '0'),
      vial : parseFloat(itemToUpdate.ItemPrice !== undefined ? itemToUpdate.ItemPrice.vial : '0'),
      tablet: parseFloat(itemToUpdate.ItemPrice !== undefined ? itemToUpdate.ItemPrice.tablet : '0'),
      itemInfoId : data.id
    })
    
  }

  async function handleSaveChanges(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();

    if(hasEmptyFields(itemData)){
      setEmptyFieldError(true)
      return;
    }

    try {
      const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item/update/${id}`, itemData)
      console.log(res)
    } catch (error) {
      console.log(error)
    }
    setSuccess(true)
    router.reload()
  }


  async function handleOnClick(e : React.SyntheticEvent<HTMLElement>) {
    e.preventDefault()

    if(hasEmptyFields(itemData)){
      setEmptyFieldError(true)
      return;
    }

    const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item`, itemData)

    router.reload()
  }
  

  if(session){
    return (
      <>
          <div className='tw-w-full tw-pb-60 tw-flex tw-flex-col tw-bg-blue-500 tw-bg-opacity-20'>
          <div className='tw-absolute tw-m-4'>
           <Button onClick={() => {router.push('/home')}} color='blue' >Go Back</Button>
         </div>
         <div className=' tw-w-full tw-flex tw-items-center tw-justify-center '>
           <div className='tw-flex '>
               <Form className='tw-w-full tw-pt-4'>
                 <Form.Field>
                     <h1 className='form_title'>Basic Item Info</h1>
                 </Form.Field>
                 <Form.Group widths='equal' >
                   <Form.Field required>
                     <label htmlFor="itemName">Item Name</label>
                     <Input value={itemData?.itemName} onChange={(e) => {handleOnChange(e, itemData, setItemData)}} id='itemName' placeholder="Item Name"/>
                   </Form.Field>        
                   <Form.Field required>
                     <label htmlFor="batchNumber">Batch Number</label>
                     <Input value={itemData?.batchNumber} onChange={(e) => {handleOnChange(e, itemData, setItemData)}} id='batchNumber' placeholder="Batch Number"/>
                   </Form.Field> 
                   <Form.Field required>
                     <label htmlFor="manufacturingDate">Manufacturing Date</label>
                     <Input value={itemData?.manufacturingDate.toString().substring(10, 0)} type={'Date'} max={getDate()} onChange={(e) => {handleDateChange(e, itemData, setItemData)}} id='manufacturingDate' placeholder="Last Name"/>
                   </Form.Field> 
                   <Form.Field required>
                     <label htmlFor="expirationDate">Expiration Date</label>
                     <Input value={itemData?.expirationDate.toString().substring(10, 0)} type={'Date'} onChange={(e) => {handleDateChange(e, itemData, setItemData)}} id='expirationDate' placeholder="Last Name"/>
                   </Form.Field>
                 </Form.Group>
                 <Form.Group>
                     <Form.Field required width={8}>
                         <label htmlFor="bottle">Price per bottle</label>
                       <Input value={itemData?.price?.bottle} min='0' step=".01" id='bottle' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {handleOnChange(e, price, setPrice)}} placeholder="00.00"/>
                     </Form.Field>
                     <Form.Field required width={8}>
                         <label htmlFor="vial">Price per vials</label>
                         <Input value={itemData?.price?.vial} min='0' step=".01" id='vial' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {handleOnChange(e, price, setPrice)}} placeholder="00.00"/>
                     </Form.Field>
                       <Form.Field required width={8}>
                           <label htmlFor="capsule">Price per Capsule</label>
                           <Input value={itemData?.price?.capsule} min='0' step=".01" id='capsule' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {handleOnChange(e, price, setPrice)}}  placeholder="00.00"/>
                       </Form.Field>
                       <Form.Field required width={8}>
                           <label htmlFor="tablet">Price per Tablet</label>
                           <Input value={itemData?.price?.tablet} min='0' step=".01" id='tablet' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {handleOnChange(e, price, setPrice)}}  placeholder="00.00"/>
                       </Form.Field>
                       <Form.Field required width={8}>
                           <label htmlFor="box">Price per Box</label>
                           <Input value={itemData?.price?.box} min='0' step=".01" id='box' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {handleOnChange(e, price, setPrice)}}  placeholder="00.00"/>
                       </Form.Field>
                   </Form.Group>
                 <Form.Field width={6}>
                     <label htmlFor="VAT">VAT</label>
                     <Select text={editing ? itemData?.VAT ? 'Vatable' : 'Vat-Exempt' : undefined} id={'VAT'} onChange={(e, item) => {handleOptionsChange(e, item, itemData, setItemData)}} defaultValue={true} options={VAT}/>
                 </Form.Field>
                   <Message
               error = {!emptyFieldsError}
               color='red'
               header='Action Forbidden'
               content='There are required fields that are empty.'
           />
           <Message
                  success = {!success}
                  color='green'
                  header='Success!'
                  content='Item Added Successfully.'
              />
                 {editing ? <div><Button onClick={(e) => {handleSaveChanges(e)}} color='blue' >Save Changes</Button> <Button onClick={() => {setItemData(emptyData); setEditing(false)}} color={'blue'} > +Add an Item</Button> </div> : <Button onClick={(e) => {handleOnClick(e)}} color='blue' >Add Item</Button>}
               </Form>
             </div>
           </div>
           <div className='tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center'>
               <div className='tw-w-full tw-h-[80vh] tw-flex tw-flex-col'>
                 <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-16 tw-ml-10 tw-mb-10'>Item List</h1>
                 <div className='tw-w-full tw-flex tw-flex-col tw-items-center'>
                 <div className='tw-w-[90%] tw-mb-4'>
                     {!editing ? <Button onClick={() => {setEditing(true)}} color='blue'>Edit Items</Button> : <Button onClick={() => {setEditing(false); setItemData(emptyData)}} color='blue' >+ Enter a New Item</Button>}
                 </div>
                   <div className='tw-w-[90%] '>
                     <IFlexTable allowDelete={false} data={itemList} headerTitles={headerTitles} color='blue' allowEditing={editing} updateItem={updateItem}/>
                   </div>
                 </div>
               </div>
           </div>
       </div>
      </>
     )
  }else{
    return <>
      <h1>Unauthorized Entry</h1>
    </>
  }

 
}
