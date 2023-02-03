import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Message, Select } from 'semantic-ui-react'


const DEPARTMENT = [
    { key: 'sales', text: 'Sales', value: 'SALES' },
    { key: 'inv', text: 'Inventory', value: 'INVENTORY'},
    { key: 'pmr', text: 'PMR', value: 'PMR'},
    { key: 'acc', text: 'Accounting', value: 'ACCOUNTING'},
  ]

export default function employee() {

    const [data, setData] = useState({
        firstName  : '',
        middleName : '',
        lastName   : '',
        code       : '',
        address    : '',
        dateHired  : '',
        department : '',
        contactNo  : '',
    })

    const [emptyFieldsError, setEmptyFieldsError] = useState(true)

    useEffect(() => {
        setEmptyFieldsError(true)
      }, [data])

    function handleChange(e : React.ChangeEvent<HTMLInputElement>, extra : string){
        setData({...data, [e.target.id] : e.target.value + extra})
    }

    async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
        e.preventDefault()
        
        if(data.firstName === '' || data.lastName === '' || data.address === '' || data.department === '' || data.dateHired === '' || data.contactNo === ''){
            setEmptyFieldsError(false)
            return;
        }

        try {
            const res = await axios.post('http://localhost:3000/api/getInfo/employee', data)
            console.log(res);
        } catch (error) {
            
        }
    }
   
    
  return (
    <Form>
        <Form.Field required>
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
        <Form.Field>
            <label htmlFor="code">Code &#40;If PMR&#41;</label>
            <Input onChange={(e) => {handleChange(e, '')}} id='code' type='text'/>
        </Form.Field>
        <Form.Field required>
            <label htmlFor="address">Address</label>
            <Input onChange={(e) => {handleChange(e, '')}} id='address' type='text'/>
        </Form.Field>
        <Form.Field>
            <label htmlFor="dateHired">Date Hired</label>
            <Input onChange={(e) => {handleChange(e, "T00:00:00Z")}} id='dateHired' type='date'/>
        </Form.Field>
        <Form.Field required>
            <label htmlFor="department">Department</label>
            <Select onChange={(e, item) => {setData({...data, department : item.value === undefined ? '' : item.value.toString() })}}defaultValue='' placeholder='--Pick a Department--' id='department' options={DEPARTMENT}/>
        </Form.Field>
        <Form.Field required>
            <label htmlFor="contactNo">Contact No.</label>
            <Input onChange={(e) => {handleChange(e, '')}} id='contactNo' type='text'/>
        </Form.Field>
        <Message
            error = {emptyFieldsError}
            color='red'
            header='Action Forbidden'
            content='There are required fields that are empty.'
        />
        <Button onClick={handleOnClick}inverted color='green' compact>Submit</Button>
        
    </Form>
  )
}
