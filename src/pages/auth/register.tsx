import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Form, FormField, Input, Message, Select } from 'semantic-ui-react'


interface EmployeeInfo {
    firstName: string
    middleInitial : string
    lastName : string
    idNumber : string
    user : {
      create : {
        email : string
        role : string | number | boolean | (string | number | boolean)[] | undefined
        username : string
        password : string
      }
    }
}

const Role = [
  { key: 'acc', text: 'Accounting', value: 'ACCOUNTING' },
  { key: 'inv', text: 'Inventory', value: 'INVENTORY' },
  { key: 'i', text: 'Information Technologies', value: 'IT' },
  { key: 's', text: 'Sales', value: 'SALES' },


]

export default function register() {

  const [data, setData]  = useState({
    firstName: '',
    middleInitial : 'N/A',
    lastName : '',
    idNumber : '',
    user : {
      create : {
        email : '',
        role : '',
        username : '',
        password : '',
      }
    },
  })

  const [password, setPassword] = useState({password : '', repassword : ''})
  const [emptyFieldsError, setEmptyFieldsError] = useState(true)
  const [passwordError, setPasswordError] = useState(false)

  useEffect(() => {
   if(password.password === password.repassword){
      setData({...data, user : { create : {...data.user.create, password : password.password}}})
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
    if(data.firstName === '' || data.idNumber === '' || data.lastName === '' || data.user.create.email === '' || data.user.create.password === '' || data.user.create.role === '' || data.user.create.password === ''){
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
            <h1 className='form_title'>Employee Info</h1>
        </FormField>
        <Form.Group widths='equal' >
            <Form.Field required>
              <label htmlFor="firstName">First Name</label>
              <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='firstName' placeholder="First Name"/>
            </Form.Field>       
            <Form.Field>
            <label htmlFor="middleInitial">Middle Initial</label>
              <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='middleInitial' placeholder="Middle Initial"/>
            </Form.Field>  
            <Form.Field required>
              <label htmlFor="lastName">Last Name</label>
              <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='lastName' placeholder="Last Name"/>
            </Form.Field>    
        </Form.Group>
        <Form.Field required width={5}>
            <label htmlFor="idNumber">ID Number</label>
            <Input onChange={(e) => {setData({...data, [e.target.id] : e.target.value})}} id='idNumber' placeholder="ie. 136419120065"/>
        </Form.Field>
        <FormField>
            <h1 className='form_title'>Account</h1>
        </FormField> 
        <Form.Group widths='equal' >
              <Form.Field required>
                <label htmlFor="username">Username</label>
                <Input onChange={(e) => {setData({...data, user : { create : {...data.user.create, [e.target.id] : e.target.value }}})}} id='username' placeholder="Username"/>
              </Form.Field>       
              <Form.Field required>
              <label htmlFor="email">Email</label>
                <Input onChange={(e) => {setData({...data, user : { create : {...data.user.create, [e.target.id] : e.target.value }}})}}  type='email' id='email' placeholder="Email"/>
              </Form.Field>  
              <Form.Field required>
                <label htmlFor="role">Department</label>
                <Select onChange={(e, item) => {setData({...data, user : { create : {...data.user.create, role : item.value }}})}} placeholder='Department' id="role" options={Role}></Select>
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
