import { DEPARTMENT } from '@prisma/client'
import axios from 'axios'
import { HOSTADDRESS, PORT } from 'functions'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Message, Select } from 'semantic-ui-react'


const DEPARTMENTS = [
    { key: 'sales', text: 'Sales', value: 'SALES' },
    { key: 'inv', text: 'Inventory', value: 'INVENTORY'},
    { key: 'pmr', text: 'PMR', value: 'PMR'},
    { key: 'acc', text: 'Accounting', value: 'ACCOUNTING'},
    { key: 'genMan', text: 'General Manager', value: DEPARTMENT.GENERAL_MANAGER},
    { key: 'districtManager', text: 'District Manager', value: DEPARTMENT.DISTRICT_MANAGER},
    { key: 'devman', text: 'Business Development Manager', value: DEPARTMENT.BUSINESS_DEVELOPMENT_MANAGER},


    
  ]

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

    
    
    return {
      props : { post : res.data.data}
    }
    
}

export default function employee({ post } : InferGetServerSidePropsType<typeof getServerSideProps>) {


    const { data } = useSession();
    useEffect(() => {
        if(!data){
          alert("Invalid Access")
          router.push('/')
        }
      }, [])

    const [Data, setData] = useState({
        firstName  : '',
        middleName : '',
        lastName   : '',
        code       : '',
        address    : '',
        dateHired  : '',
        department : '',
        contactNo  : '',
        email : '',
    })

    const [emptyFieldsError, setEmptyFieldsError] = useState(true)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setEmptyFieldsError(true)
      }, [Data])

    useEffect(() => {
        setData({...Data, email : post.email})
    }, [])

    function handleChange(e : React.ChangeEvent<HTMLInputElement>, extra : string){
        setData({...Data, [e.target.id] : e.target.value + extra})
    }

    async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
        e.preventDefault()
        if(Data.firstName === '' || Data.lastName === '' || Data.address === '' || Data.department === '' || Data.dateHired === '' || Data.contactNo === ''){
            setEmptyFieldsError(false)
            return;
        }



        setSuccess(true)

        try {
            const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/getInfo/employee`, Data)
            
        } catch (error) {
            
        }
        router.push('/home')
    }
   
    function getDate() : string{
        const date = new Date(Date.now())
        const localDate = new Date(date.getTime() +  24 * 60 * 1000).toISOString()

        return localDate.substring(0, 10)
    }
    
  return (
   <div className='tw-w-full tw-h-screen tw-flex tw-justify-center tw-items-center'>
        <div className='tw-w-[50%]'>
            <Form>
              <Form.Field>
                  <h1 className='form_title'>Add Employee Info</h1>
              </Form.Field>
                <Form.Group >
                    <Form.Field required >
                        <label htmlFor="First Name">First Name</label>
                        <Input onChange={(e) => {handleChange(e, '')}} id='firstName' type='text'/>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="middleName">Middle Name</label>
                        <Input onChange={(e) => {handleChange(e, '')}} id='middleName' type='text'/>
                    </Form.Field>
                    <Form.Field required>
                        <label htmlFor="lastName">Last Name</label>
                        <Input onChange={(e) => {handleChange(e, '')}} id='lastName' type='text'/>
                    </Form.Field>
                </Form.Group>
                {Data.department === 'PMR' ? 
                    <Form.Field width={4}>
                        <label htmlFor="code">Code &#40;If PMR&#41;</label>
                        <Input onChange={(e) => {handleChange(e, '')}} id='code' type='text'/>
                    </Form.Field> : null
                }
                <Form.Field required>
                    <label htmlFor="address">Address</label>
                    <Input onChange={(e) => {handleChange(e, '')}} id='address' type='text'/>
                </Form.Field>
                <Form.Group>
                    <Form.Field>
                        <label htmlFor="dateHired">Date Hired</label>
                        <Input max={getDate()} onChange={(e) => {handleChange(e, "T00:00:00Z")}} id='dateHired' type='date'/>
                    </Form.Field>
                    <Form.Field required>
                        <label htmlFor="department">Department</label>
                        <Select onChange={(e, item) => {setData({...Data, department : item.value === undefined ? '' : item.value.toString() })}} defaultValue='' placeholder='--Pick a Department--' id='department' options={DEPARTMENTS}/>
                    </Form.Field>
                    <Form.Field required>
                        <label htmlFor="contactNo">Contact No.</label>
                        <Input onChange={(e) => {handleChange(e, '')}} id='contactNo' type='text'/>
                    </Form.Field>
                </Form.Group>
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
                    content='Employee Info Added Successfully.'
                />
                <Button onClick={handleOnClick} color='blue' compact>Submit</Button>
            </Form>
        </div>
   </div>
  )
}
