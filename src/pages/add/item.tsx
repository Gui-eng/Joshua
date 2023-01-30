import axios from 'axios'
import Itable from 'components/Itable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Message } from 'semantic-ui-react'



export const getServerSideProps : GetServerSideProps = async () => {
  const res = await axios.get("http://localhost:3000/api/getInfo/item")
  return {
    props : { info : res.data.data}
  }
}


const headerTitles = ["id", "Item Name", "Batch Number", "Manufacturing Date", "Expiration Date" , "unitPrice"]

export default function item({ info } : InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [data, setData] = useState({
    itemName          : '',
    batchNumber       : '',
    manufacturingDate : '',
    ExpirationDate    : '',
    unitPrice         : ''
  })

  const [emptyFieldsError, setEmptyFieldsError] = useState(true)

  useEffect(() => {
    setEmptyFieldsError(true)
  }, [data])

  async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();
    if(data.itemName === '' || data.batchNumber === '' || data.unitPrice === '' || data.manufacturingDate === '' || data.ExpirationDate === ''){
      setEmptyFieldsError(false)
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/getInfo/item', data)
      console.log(res)
    } catch (error) {
      console.log(error)
    }
      
    }

  return (
    <div className='tw-w-full tw-h-screen tw-flex tw-bg-teal-700 tw-bg-opacity-20'>
      <div className='tw-h-full tw-w-[50%] tw-flex tw-items-center tw-justify-center '>
        <div className='tw-w-[50%]'>
            <Form>
              <Form.Field>
                  <h1 className='form_title'>Basic Item Info</h1>
              </Form.Field>
              <Form.Group widths='equal' >
                <Form.Field required>
                  <label htmlFor="itemName">Item Name</label>
                  <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='itemName' placeholder="Item Name"/>
                </Form.Field>        
                <Form.Field required>
                  <label htmlFor="batchNumber">Batch Number</label>
                  <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='batchNumber' placeholder="Batch Number"/>
                </Form.Field> 
              </Form.Group>
              <Form.Group>
                <Form.Field required>
                  <label htmlFor=" manufacturingDate">Manufacturing Date</label>
                  <Input type={'Date'} onChange={(e) => {setData({...data, [e.target.id] : e.target.value + "T00:00:00Z" })}} id='manufacturingDate' placeholder="Last Name"/>
                </Form.Field> 
                <Form.Field required>
                  <label htmlFor="ExpirationDate">Expiration Date</label>
                  <Input type={'Date'} onChange={(e) => {setData({...data, [e.target.id] : e.target.value + "T00:00:00Z" })}} id='ExpirationDate' placeholder="Last Name"/>
                </Form.Field>
              </Form.Group>
              <Form.Field required width={8}>
                  <label htmlFor="unitPrice">Unit Price</label>
                  <Input step=".01" label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='unitPrice' placeholder="00.00"/>
                </Form.Field>
                <Message
            error = {emptyFieldsError}
            color='red'
            header='Action Forbidden'
            content='There are required fields that are empty.'
        />
              <Button onClick={handleOnClick} inverted color='green' >Add Item</Button>
            </Form>
          </div>
        </div>
        <div className='tw-w-[50%] tw-h-full tw-flex tw-items-center tw-justify-center'>
            <div className='tw-w-full tw-h-[80vh] tw-flex tw-flex-col'>
              <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-16 tw-ml-10 tw-mb-10'>Item List</h1>
              <div className='tw-w-full tw-flex tw-justify-center'>
                <div className='tw-w-[90%]'>
                    <Itable data={info} headerTitles={headerTitles}/>
                </div>
              </div>
            </div>
        </div>
    </div>
  )
}
