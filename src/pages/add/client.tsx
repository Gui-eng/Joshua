import axios, { AxiosError } from 'axios'
import Itable from 'components/Itable'
import IFlexTable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Message, Select } from 'semantic-ui-react'
import {hasEmptyFields, handleOnChange, handleOptionsChange, find, HOSTADDRESS, PORT} from '../../../functions'
import { Option, EmployeeInfo, ClientInfo } from '../../../types'

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}


const headerTitles = ["id", "Company Name", "Company Address", "TIN", "PMR"]

const emptyClientData : ClientInfo = {
  companyName :'',
  address     :'',
  TIN         :'',
  pmrId       : '',
}

export const getServerSideProps : GetServerSideProps = async () => {

    const pmr = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/employee/pmr`)

    const clients = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/client`)


    return {
      props : { clients : clients.data.data, pmr : pmr.data.data}
    }
}

export default function item({ clients, pmr } : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()


  const pmrList : Option[] = pmr.map((item : EmployeeInfo) => {
    return {
      id : 'pmrId',
      key : item.id,
      value : item.id,
      text : item.code + ": " + item.firstName + " " + item.lastName
    }
  })

  const clientList = clients.map((item : ClientInfo) => {

    const pmrData : EmployeeInfo = pmr.find((pmr : EmployeeInfo) => {
      return item.pmrId === pmr.id
    })


    return {
      id : item.id,
      companyName : item.companyName,
      address : item.address,
      TIN : item.TIN,
      pmr : pmrData !== undefined ? pmrData.code : "-"
    }
  })



  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      !session && router.push('/')
    }

    fetchSession();
  }, []);
  

  const [emptyFieldsError, setEmptyFieldsError] = useState(true)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [id, setId] = useState('')

  const [clientData, setClientData] = useState<ClientInfo>(emptyClientData)


  async function handleDelete(info : any, link : string) {
      const res = await axios.delete(link)
      router.reload()
  }

  

  function updateItem(data : any) {
      const clientInfo = find(data.id, clients)
      const pmrInfo = find(clientInfo.pmrId, pmr)

      setId(clientInfo.id)
      setClientData({
        address : clientInfo.address,
        companyName : clientInfo.companyName,
        pmrId : pmrInfo  !== undefined ? pmrInfo.id : '',
        TIN : clientInfo.TIN,
      })
  }

  async function handleSaveChanges(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();

    if(hasEmptyFields(clientData)){
      setEmptyFieldsError(false)
      return;
    }

    try {
      const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/getInfo/client/update/${id}`, clientData)
      console.log(res)
      setSuccess(true)
    router.reload()
    } catch (error) {
      console.log(error)
    }
   
  }

  useEffect(() => {
    setEmptyFieldsError(true)
  }, [clientData])

  useEffect(() => {
    if(!editing){
      setClientData(emptyClientData)
    }
  }, [editing])

  async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();
    if(hasEmptyFields(clientData)){
      console.log(clientData)
      setEmptyFieldsError(false)
      return;
    }
    
    try {
      const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/getInfo/client`, clientData
      )
       router.reload()
      setSuccess(true)
    } catch (error) {
      if(axios.isAxiosError(error)){
      console.error(error)

      }
      
    }


    }
    



  return (
    <>
    <div className='tw-w-full tw-h-screen tw-flex tw-bg-blue-500 tw-bg-opacity-20'>
    <div className='tw-absolute tw-m-4'>
      <Button onClick={() => {router.push('/home')}} color='blue' >Go Back</Button>
    </div>
    <div className='tw-h-full tw-w-[50%] tw-flex tw-items-center tw-justify-center '>
      <div className='tw-w-[50%]'>
        
          <Form>
            <Form.Field>
                <h1 className='form_title'>Basic Client Info</h1>
            </Form.Field>
              <Form.Field required>
                <label htmlFor="companyName">Company Name</label>
                <Input value={clientData.companyName} onChange={(e) => {handleOnChange(e, clientData, setClientData)}} id='companyName' placeholder="Company Name"/>
              </Form.Field>                        
            <Form.Field required>
                <label htmlFor="address">Address</label>
                <Input value={clientData.address} onChange={(e) => {handleOnChange(e, clientData, setClientData)}} id='address' placeholder="Company Address"/>
             </Form.Field>
             <Form.Field required>
                <label htmlFor="TIN">TIN</label>
                <Input value={clientData.TIN} onChange={(e) => {handleOnChange(e, clientData, setClientData)}} id='TIN' placeholder="ie. 000–123–456–001"/>
             </Form.Field>
             <Form.Field required>
                      <label htmlFor="pmrId">PMR</label>
                      <Select value={clientData.pmrId} id={'pmrId'} options={pmrList} placeholder='-- PMR --' onChange={(e, item) => {handleOptionsChange(e, item, clientData, setClientData)}}/>
                </Form.Field>
             <Message
          error = {emptyFieldsError}
          color='red'
          header='Action Forbidden'
          content='There are required fields that are empty.'
      />
            <Message
                  success = {!success}
                  color='green'
                  header='Success!'
                  content='Client Added Successfully.'
              />

            {editing ? <Button onClick={handleSaveChanges} color='blue' >Save Changes</Button> : <div className='tw-flex'><Button onClick={handleOnClick} color='blue' > + Add Client</Button><Button color='blue' onClick={() => {setClientData(emptyClientData)}}>Clear</Button></div>}
          </Form>
        </div>
      </div>
      <div className='tw-w-[50%] tw-h-full tw-flex tw-items-center tw-justify-center'>
          <div className='tw-w-full tw-h-[80vh] tw-flex tw-flex-col'>
            <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-16  tw-mb-10'>Client List</h1>
            
            <div className='tw-w-full tw-flex tw-flex-col tw-justify-center'>
            <div className='tw-mb-4'>
                 {editing ? <Button onClick={() => {setEditing(false)}} color='blue'>+ Add item</Button> : <Button onClick={() => {setEditing(true)}} color='blue'>Edit</Button>}
            </div>
              <div className='tw-w-[90%]'>
                  <IFlexTable data={clientList ? clientList : []} headerTitles={headerTitles} allowEditing={editing} updateItem={updateItem}/>
              </div>
            </div>
           
          </div>
      </div>
  </div>
  </>
  )
}
