import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Form, FormField, Input, Message, Select } from 'semantic-ui-react'


interface User {
    email : string
    role : string 
    username : string
    password : string
     
}

const Role = [
  { key: 'acc', text: 'Accounting', value: 'ACCOUNTING' },
  { key: 'inv', text: 'Inventory', value: 'INVENTORY' },
  { key: 'i', text: 'Information Technologies', value: 'IT' },
  { key: 's', text: 'Sales', value: 'SALES' },


]

export default function register() {

  const router = useRouter()
  const session = useSession();

  // useEffect(() => {
  //   if(!session.data){
  //     alert("Invalid Access")
  //     router.push('/')
  //   }
  // }, [])

  const [data, setData]  = useState<User>({
    email : '',
    role : '',
    username : '',
    password : '',
  })

  const [password, setPassword] = useState({password : '', repassword : ''})
  const [emptyFieldsError, setEmptyFieldsError] = useState(true)
  const [passwordError, setPasswordError] = useState(false)

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
              <Form.Field required>
                <label htmlFor="role">Department</label>
                <Select onChange={(e, item) => {setData({...data, role : item.value })}} placeholder='Department' id="role" options={Role}></Select>
              </Form.Field>    
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
        <Form.Button inverted color='green' onClick={(e) => {handleSubmit(e)}}>Submit</Form.Button>
      </Form>
    </div>
  )
}
