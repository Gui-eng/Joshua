import axios from 'axios'
import Itable from 'components/Itable'
import IFlexTable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Message, Select } from 'semantic-ui-react'

const VAT = [
  { key: 'vat', text: 'Vatable', value: 'VATABLE' },
  { key: 'nvat', text: 'Vat-Exempt', value: 'VAT-EXCEMPT'},

]


export const getServerSideProps : GetServerSideProps = async () => {
  const res = await axios.get("http://localhost:3000/api/getInfo/item")
  return {
    props : { info : res.data.data}
  }
}


const headerTitles = ["id", "Item Name", "Batch Number", "Manufacturing Date", "Expiration Date" , "Per Bottle", "Per Vial", "Per Piece", "Per Box", "Vatable?"]

export default function item({ info } : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();



  // useEffect(() => {
  //   if(!session.data){
  //     alert("Invalid Access")
  //     router.push('/')
  //   }
  // }, [])

  const [data, setData] = useState({
    itemName          : '',
    batchNumber       : '',
    manufacturingDate : '',
    ExpirationDate    : '',
    priceBottle     :  '',
    priceVial       :  '',
    pricePiece       : '',
    priceBox          : '',
    VAT             :  true,
  })

  const [emptyFieldsError, setEmptyFieldsError] = useState(true)
  const [editing, setEditing] = useState(false)
  const [maxDate, setMaxDate] = useState('')
  const [id, setId] = useState('')

  const [tableData, setTableData] = useState(info.map((item : any) => {
    return {
    id : item.id,
    itemName : item.itemName,
    batchNumber : item.batchNumber,
    ExpirationDate : item.ExpirationDate.substring(0,10), 
    manufacturingDate : item.manufacturingDate.substring(0, 10),
    priceVial : item.priceVial,
    priceBottle : item.priceBottle,
    pricePiece : item.pricePiece,
    priceBox : item.priceBox,
    VAT : item.VAT ? "Yes" : "No", 
  }
  }))


  useEffect(() => {
    setEmptyFieldsError(true)
  }, [data])

  function setEdit(edit : any){
    setEditing(true)
    const filter = {...edit, VAT : edit.VAT === "Yes" ? true : false, 
    manufacturingDate : edit.manufacturingDate + "T00:00:00Z",
    ExpirationDate    : edit.ExpirationDate + "T00:00:00Z",
    priceBottle :  parseFloat(edit.priceBottle),
    priceVial       :  parseFloat(edit.priceVial),
    pricePiece       : parseFloat(edit.pricePiece),
    priceBox          : parseFloat(edit.priceBox),}
    setData(filter)
    setId(edit.id)
  }

  async function handleDelete(info : any){
      const res = await axios.delete(`http://localhost:3000/api/getInfo/item/update/${info.id}`)
      router.reload()
  }

  async function handleSaveEdit(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();

    if(data.itemName === '' || data.batchNumber === '' || data.priceBottle === '' || data.priceVial === '' || data.pricePiece === '' || data.manufacturingDate === '' || data.ExpirationDate === ''){
      setEmptyFieldsError(false)
      return;
    }

    

    try {
      const res = await axios.post(`http://localhost:3000/api/getInfo/item/update/${id}`, data)
    } catch (error) {
      console.log(error)
    }

    router.reload()
  }
  

  async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();

      if(data.itemName === '' || data.batchNumber === '' || data.priceBottle === '' || data.priceVial === '' || data.pricePiece === '' || data.manufacturingDate === '' || data.ExpirationDate === ''){
        setEmptyFieldsError(false)
        return;
      }

      try {
        const res = await axios.post('http://localhost:3000/api/getInfo/item', data)
      } catch (error) {
        console.log(error)
      }
      
      router.reload()
    }

  return (
   session.data && 
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
                  <Input value={data.itemName} onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='itemName' placeholder="Item Name"/>
                </Form.Field>        
                <Form.Field required>
                  <label htmlFor="batchNumber">Batch Number</label>
                  <Input value={data.batchNumber} onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='batchNumber' placeholder="Batch Number"/>
                </Form.Field> 
                <Form.Field required>
                  <label htmlFor=" manufacturingDate">Manufacturing Date</label>
                  <Input value={data.manufacturingDate !== undefined ? data.manufacturingDate.substring(0,10) : ''} type={'Date'} max={maxDate} onChange={(e) => {setData({...data, [e.target.id] : e.target.value + "T00:00:00Z" })}} id='manufacturingDate' placeholder="Last Name"/>
                </Form.Field> 
                <Form.Field required>
                  <label htmlFor="ExpirationDate">Expiration Date</label>
                  <Input value={data.ExpirationDate !== undefined ? data.ExpirationDate.substring(0,10) : ''} type={'Date'} onChange={(e) => {(setData({...data, [e.target.id] : e.target.value + "T00:00:00Z" }), setMaxDate(e.target.value))}} id='ExpirationDate' placeholder="Last Name"/>
                </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field required width={8}>
                      <label htmlFor="priceBottle">Price per bottle</label>
                      <Input value={data.priceBottle} min='0' step=".01" id='priceBottle' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {setData({...data, [e.target.id] : parseFloat(e.target.value)})}} placeholder="00.00"/>
                  </Form.Field>
                  <Form.Field required width={8}>
                      <label htmlFor="priceVial">Price per vials</label>
                      <Input value={data.priceVial} min='0' step=".01" id='priceVial' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {setData({...data, [e.target.id] : parseFloat(e.target.value)})}} placeholder="00.00"/>
                  </Form.Field>
                    <Form.Field required width={8}>
                        <label htmlFor="pricePiece">Price per Piece</label>
                        <Input value={data.pricePiece} min='0' step=".01" id='pricePiece' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {setData({...data, [e.target.id] : parseFloat(e.target.value)})}}  placeholder="00.00"/>
                    </Form.Field>
                    <Form.Field required width={8}>
                        <label htmlFor="priceBox">Price per Box</label>
                        <Input value={data.priceBox} min='0' step=".01" id='priceBox' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {setData({...data, [e.target.id] : parseFloat(e.target.value)})}}  placeholder="00.00"/>
                    </Form.Field>
                </Form.Group>
              <Form.Field width={6}>
                  <label htmlFor="VAT">VAT</label>
                  <Select value={data.VAT ? 'VATABLE' : 'VAT-EXCEMPT'} text={editing ? data.VAT ? 'Vatable' : 'Vat-Exempt' : undefined} id='VAT' onChange={(e, item) => {setData({...data, VAT : item.value === 'VATABLE' ? true : false})}} defaultValue={'VATABLE'} placeholder={'Vatable'} options={VAT}/>
              </Form.Field>
                <Message
            error = {emptyFieldsError}
            color='red'
            header='Action Forbidden'
            content='There are required fields that are empty.'
        />
              {editing ? <div><Button onClick={handleSaveEdit} color='blue' >Save Changes</Button> <Button onClick={() => {setEditing(false); setData({
    itemName          : '',
    batchNumber       : '',
    manufacturingDate : '',
    ExpirationDate    : '',
    priceBottle     :  '',
    priceVial       :  '',
    pricePiece       : '',
    priceBox          : '',
    VAT             :  true,
  })}} color={'blue'} > +Add an Item</Button>  </div>: <Button onClick={handleOnClick} color='blue' >Add Item</Button>}
            </Form>
          </div>
        </div>
        <div className='tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center'>
            <div className='tw-w-full tw-h-[80vh] tw-flex tw-flex-col'>
              <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-16 tw-ml-10 tw-mb-10'>Item List</h1>
              <div className='tw-w-full tw-flex tw-flex-col tw-items-center'>
              <div className='tw-w-[90%] tw-mb-4'>
                  {!editing ? <Button onClick={() => {setEditing(true)}} color='blue'>Edit Items</Button> : <Button onClick={() => {setEditing(false); setData({
    itemName          : '',
    batchNumber       : '',
    manufacturingDate : '',
    ExpirationDate    : '',
    priceBottle     :  '',
    priceVial       :  '',
    pricePiece       : '',
    priceBox          : '',
    VAT             :  true,
  })}} color='blue' >+ Enter a New Item</Button>}
              </div>
                <div className='tw-w-[90%] '>
                  <IFlexTable allowDelete={false} data={tableData} headerTitles={headerTitles} color='blue' handleEditing={setEdit} editing={editing} handleDeleting={handleDelete}/>
                </div>
              </div>
            </div>
        </div>
    </div>
   </>
  )
}
