import axios from 'axios'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Form, FormField, Input, Message, Select } from 'semantic-ui-react'


interface User {
    email : string
    role : string 
    username : string
    password : string
    isAdmin : Boolean
}

const Role = [
  { key: 'acc', text: 'Accounting', value: 'ACCOUNTING' },
  { key: 'inv', text: 'Inventory', value: 'INVENTORY' },
  { key: 'i', text: 'Information Technologies', value: 'IT' },
  { key: 's', text: 'Sales', value: 'SALES' },


]


export const getServerSideProps : GetServerSideProps = async (context) => {
  try {
    const res = await axios.get('http://localhost:3000/api/getInfo/users/one')
    return {props: { datum : res.data}}
  } catch (error) {
    return { props : { error : 'Something Went Wrong'}}
  }
}

export default function register({ datum } : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();
  const [isAdmin, setIsAdmin] = useState(false)
 

  

  const [data, setData]  = useState<User>({
    email : '',
    role : 'ACCOUNTING',
    username : '',
    password : '',
    isAdmin : isAdmin
  })



  useEffect(() => {
    if(datum.length === 0){
      setIsAdmin(true)
      return;
    }

    if(!session.data){
      alert("Invalid Access")
      router.push('/')
    }
  }, [])

  const [password, setPassword] = useState({password : '', repassword : ''})
  const [emptyFieldsError, setEmptyFieldsError] = useState(true)
  const [passwordError, setPasswordError] = useState(false)

  useEffect(() => {
    if(isAdmin){
      setData({...data, isAdmin : isAdmin})
    }
  }, [isAdmin])

  useEffect(() => {
   if(password.password === password.repassword){
      setData({...data, password : password.password})
  }},[password])

  useEffect(() => {
    (setEmptyFieldsError(true), setPasswordError(false))
  }, [data, password])

  async function handleSubmit(e : React.MouseEvent<HTMLButtonElement>){
    e.preventDefault()
    if(password.password !== password.repassword){
      setPasswordError(true)
      return;
    }
    if(data.email === '' || data.password === '' || data.role === '' || data.password === ''){
      setEmptyFieldsError(false)
      return;
    }

    setEmptyFieldsError(true)
    try {

      const res = await axios.post("http://localhost:3000/api/register", data)
      console.log(res)
    } catch (error) {
      console.log(error)
    }
    
    router.push('/')

  }

  return (
    <div className='form_container'>
      <Form unstackable>
        <FormField>
            <h1 className='form_title'> Add Account</h1>
        </FormField> 
        <Form.Group widths='equal' >
              <Form.Field required>
                <label htmlFor="username">Username</label>
                <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value })}} id='username' placeholder="Username"/>
              </Form.Field>       
              <Form.Field required>
              <label htmlFor="email">Email</label>
                <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value })}}  type='email' id='email' placeholder="Email"/>
              </Form.Field>  
              {datum.length > 0 ? <Form.Field required>
                <label htmlFor="role">Department</label>
                <Select onChange={(e, item) => {setData({...data, role : item.value !== undefined ? item.value.toString() : " " })}} placeholder='Department' id="role" options={Role}></Select>
              </Form.Field> : null}   
        </Form.Group> 
        <Form.Field required>
            <label htmlFor="password">New password</label>
            <Input error={passwordError} onChange={(e) => {setPassword({...password, [e.target.id] : e.target.value})}} type='password' id='password' placeholder="Password"/>
        </Form.Field>  
        <Form.Field required>
            <label htmlFor="repassword">Re-type new password</label>
            <Input error={passwordError} onChange={(e) => {setPassword({...password, [e.target.id] : e.target.value})}} type='password' id='repassword' placeholder="Re-type password"/>
        </Form.Field>  
        <Message
            error = {emptyFieldsError}
            color='red'
            header='Action Forbidden'
            content='There are required fields that are empty.'
        />
         <Message
            error = {!passwordError}
            color='red'
            header='Action Forbidden'
            content='Password does not match!'
        />
        <Form.Button color='blue' onClick={(e) => {handleSubmit(e)}}>Submit</Form.Button>
      </Form>
    </div>
  )
}
