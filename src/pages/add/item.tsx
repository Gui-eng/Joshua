import axios from 'axios'
import Itable from 'components/Itable'
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


const headerTitles = ["id", "Item Name", "Batch Number", "Manufacturing Date", "Expiration Date" , "unitPrice"]

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
    VAT             :  true,
  })

  const [emptyFieldsError, setEmptyFieldsError] = useState(true)
  const [maxDate, setMaxDate] = useState('')

  useEffect(() => {
    setEmptyFieldsError(true)
  }, [data])

  

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
      
    }

  return (
   session.data && 
   <>
       <div className='tw-w-full tw-h-screen tw-flex tw-bg-teal-700 tw-bg-opacity-20'>
      <div className='tw-h-full tw-w-[50%] tw-flex tw-items-center tw-justify-center '>
        <div className='tw-w-[60%]'>
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
                  <Input type={'Date'} max={maxDate} onChange={(e) => {setData({...data, [e.target.id] : e.target.value + "T00:00:00Z" })}} id='manufacturingDate' placeholder="Last Name"/>
                </Form.Field> 
                <Form.Field required>
                  <label htmlFor="ExpirationDate">Expiration Date</label>
                  <Input type={'Date'} onChange={(e) => {(setData({...data, [e.target.id] : e.target.value + "T00:00:00Z" }), setMaxDate(e.target.value))}} id='ExpirationDate' placeholder="Last Name"/>
                </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field required width={8}>
                      <label htmlFor="priceBottle">Price per bottle</label>
                      <Input min='0' step=".01" id='priceBottle' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {setData({...data, [e.target.id] : parseFloat(e.target.value)})}} placeholder="00.00"/>
                  </Form.Field>
                  <Form.Field required width={8}>
                      <label htmlFor="priceVial">Price per vials</label>
                      <Input min='0' step=".01" id='priceVial' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {setData({...data, [e.target.id] : parseFloat(e.target.value)})}} placeholder="00.00"/>
                  </Form.Field>
                  <Form.Field required width={8}>
                      <label htmlFor="pricePiece">Price per box</label>
                      <Input min='0' step=".01" id='pricePiece' label={{content : "₱"}} labelPosition='right' type={'number'} onChange={(e) => {setData({...data, [e.target.id] : parseFloat(e.target.value)})}}  placeholder="00.00"/>
                  </Form.Field>
              </Form.Group>
              <Form.Field width={6}>
                  <label htmlFor="VAT">VAT</label>
                  <Select id='VAT' onChange={(e, item) => {setData({...data, VAT : item.value === 'VATABLE' ? true : false})}} defaultValue={'VATABLE'} placeholder={'Vatable'} options={VAT}/>
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
   </>
  )
}
