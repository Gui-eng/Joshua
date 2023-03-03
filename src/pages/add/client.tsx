import axios from 'axios'
import Itable from 'components/Itable'
import IFlexTable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
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

  const router = useRouter()
  const session = useSession();

  // useEffect(() => {
  //   if(!session.data){
  //     alert("Invalid Access")
  //     router.push('/')
  //   }
  // }, [])
  

  const [emptyFieldsError, setEmptyFieldsError] = useState(true)
  const [success, setSuccess] = useState(false)
  const [editing, setEditing] = useState(false)
  const [id, setId] = useState('')

  const [data, setData] = useState({
    companyName :'',
    address     :'',
    TIN         :'',
  })

  async function setEdit(info : any){
    setEditing(true)
    setData(info)
    setId(info.id)
  }

  async function handleDelete(info : any) {
      const res = await axios.delete(`http://localhost:3000/api/getInfo/client/update/${info.id}`)
      router.reload()
  }

  async function handleSaveChanges(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();
    if(data.companyName === '' || data.address === '' || data.TIN === ''){
      setEmptyFieldsError(false)
      return;
    }


    try {
      const res = await axios.post(`http://localhost:3000/api/getInfo/client/update/${id}`, data)

    } catch (error) {
      console.log(error)
    }
    setSuccess(true)
    router.reload()
  }

  useEffect(() => {
    setEmptyFieldsError(true)
  }, [data])

  async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();
    if(data.companyName === '' || data.address === '' || data.TIN === ''){
      setEmptyFieldsError(false)
      return;
    }
    
    try {
      const res = await axios.post('http://localhost:3000/api/getInfo/client', data)

    } catch (error) {
      console.log(error)
    }
    setSuccess(true)
    router.reload()
    }
    



  return (
    session.data && 
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
                  <Input value={data.companyName} onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='companyName' placeholder="Company Name"/>
                </Form.Field>                        
              <Form.Field required>
                  <label htmlFor="address">Address</label>
                  <Input value={data.address} onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='address' placeholder="Company Address"/>
               </Form.Field>
               <Form.Field required>
                  <label htmlFor="TIN">TIN</label>
                  <Input value={data.TIN} onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='TIN' placeholder="ie. 000–123–456–001"/>
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

              {editing ? <Button onClick={handleSaveChanges} color='blue' >Save Changes</Button> : <Button onClick={handleOnClick} color='blue' > + Add Client</Button>}
            </Form>
          </div>
        </div>
        <div className='tw-w-[50%] tw-h-full tw-flex tw-items-center tw-justify-center'>
            <div className='tw-w-full tw-h-[80vh] tw-flex tw-flex-col'>
              <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-16  tw-mb-10'>Client List</h1>
              
              <div className='tw-w-full tw-flex tw-flex-col tw-justify-center'>
              <div className='tw-mb-4'>
                  {!editing ? <Button onClick={() => {setEditing(true)}} color='blue'>Edit Items</Button> : <Button onClick={() => {setEditing(false); setData({address : '', companyName : '' , TIN : ''})}} color='blue' >+ Enter a New Client</Button>}
              </div>
                <div className='tw-w-[90%]'>
                    <IFlexTable data={info ? info : []} headerTitles={headerTitles} handleEditing={setEdit} editing={editing} handleDeleting={handleDelete} allowDelete={true}/>
                </div>
              </div>
             
            </div>
        </div>
    </div>
    </>
  )
}
