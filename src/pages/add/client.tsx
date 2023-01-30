import axios from 'axios'
import Itable from 'components/Itable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Message } from 'semantic-ui-react'



const headerTitles = ["id", "Company Name", "Company Address", "TIN"]

export const getServerSideProps : GetServerSideProps = async () => {
    const res = await axios.get("http://localhost:3000/api/getInfo/client")
    return {
      props : { info : res.data.data}
    }
}

export default function item({ info } : InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  console.log(info)
  const [emptyFieldsError, setEmptyFieldsError] = useState(true)

  const [data, setData] = useState({
    companyName :'',
    address     :'',
    TIN         :'',
  })

  useEffect(() => {
    setEmptyFieldsError(true)
  }, [data])

  async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();
    if(data.companyName === '' || data.address === '' || data.TIN === ''){
      setEmptyFieldsError(false)
      return;
    }
    console.log(data)
    try {
      const res = await axios.post('http://localhost:3000/api/getInfo/client', data)
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
                  <h1 className='form_title'>Basic Client Info</h1>
              </Form.Field>
                <Form.Field required>
                  <label htmlFor="companyName">Company Name</label>
                  <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='companyName' placeholder="Company Name"/>
                </Form.Field>                        
              <Form.Field required>
                  <label htmlFor="address">Address</label>
                  <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='address' placeholder="Company Address"/>
               </Form.Field>
               <Form.Field required>
                  <label htmlFor="TIN">TIN</label>
                  <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='TIN' placeholder="ie. 000–123–456–001"/>
               </Form.Field>
               <Message
            error = {emptyFieldsError}
            color='red'
            header='Action Forbidden'
            content='There are required fields that are empty.'
        />

              <Button onClick={handleOnClick} inverted color='green' >Add Client</Button>
            </Form>
          </div>
        </div>
        <div className='tw-w-[50%] tw-h-full tw-flex tw-items-center tw-justify-center'>
            <div className='tw-w-full tw-h-[80vh] tw-flex tw-flex-col'>
              <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-16 tw-ml-10 tw-mb-10'>Client List</h1>
              <div className='tw-w-full tw-flex tw-justify-center'>
                <div className='tw-w-[90%]'>
                    <Itable data={info ? info : []} headerTitles={headerTitles}/>
                </div>
              </div>
            </div>
        </div>
    </div>
  )
}
