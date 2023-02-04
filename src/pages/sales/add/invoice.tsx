import axios from 'axios'
import _ from 'lodash'
import Itable from 'components/Itable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Form, FormField, Input, Message } from 'semantic-ui-react'

interface Client{
  id          :String
  companyName :String 
  address     :String
  TIN         :String 
}

interface Employee {
  id         :String     
  firstName  :String
  middleName :String
  lastName   :String
  code       :String
  address    :String
  dateHired  :String
  department :String
  contactNo  :String
}

const headerTitles = ["id", "Company Name", "Company Address", "TIN"]

export const getServerSideProps : GetServerSideProps = async () => {
    const res = await axios.get("http://localhost:3000/api/getInfo/client")
    let opt = res.data.data.map((items : Client, index : number) => {
      return {
        text : items.companyName,
        value : items.companyName,
        key : items.id
      }
    })

    const pmr = await axios.get("http://localhost:3000/api/getInfo/employee/pmr")

    const pmrCodes = pmr.data.data.map((item : Employee) => {
      return {
        text : item.code + " " + item.firstName + " " + item.lastName,
        value : item.id,
        key : item.id
      }
    })

    const item = await axios.get('http://localhost:3000/api/getInfo/item')
    
    return {
      props : { info : res.data.data, options : opt , pmrCodes : pmrCodes, items : item.data.data}
    }
}

export default function item({ info, options, pmrCodes, items} : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();

  // useEffect(() => {
  //   if(!session.data){
  //     alert("Invalid Access")
  //     router.push('/')
  //   }
  // }, [])
  

  const [emptyFieldsError, setEmptyFieldsError] = useState(true)

  const [data, setData] = useState({
    companyName :'',
    address     :'',
    TIN         :'',
  })

  const [client, setClient] = useState<Client>()
  const [item, setItem] = useState(_.uniq(items.itemName))
  
  function clientFind(name : any){
    setClient(info.find((item : Client) => {
      return item.companyName === name
    }))
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
    console.log(data)
    try {
      const res = await axios.post('http://localhost:3000/api/getInfo/client', data)
      console.log(res)
    } catch (error) {
      console.log(error)
    }
      
    }
  
    console.log(items)

  return (
    // session.data && 
    <>
      <Form>
        <Form.Group>
            <Form.Field>
                <label htmlFor="companyName">Company Name</label>
                <Dropdown
                    id = 'companyName'
                    placeholder='--Company Name--'
                    search
                    selection
                    options={options}
                    onChange={(e, item) => {clientFind(item.value)}}
                />
            </Form.Field>
            <Form.Field>
                <label htmlFor="address">Address</label>
                <Input id="address" value={client === undefined ? "" : client.address} readOnly/>
            </Form.Field>
            <Form.Field>
                <label htmlFor="TIN">TIN</label>
                <Input id="TIN" value={client === undefined ? "" : client.TIN} readOnly/>
            </Form.Field>
            <Form.Field>
                <label htmlFor="remarks">Remarks</label>
                <Input id="remarks" placeholder="Remarks" />
            </Form.Field>
        </Form.Group>
        <Form.Group>
            <Form.Field>
                <label htmlFor="dateIssued">Date Issued</label>
                <Input type='date' id="dateIssued"/>
            </Form.Field>
            <Form.Field>
                <label htmlFor="PMR">PMR</label>
                <Dropdown
                  id = "PMR"
                  placeholder='--PMR Code--'
                  search
                  selection
                  wrapSelection
                  options={pmrCodes}
                />
            </Form.Field>
            <Form.Field>
              <label htmlFor="terms">Terms</label>
              <Input type='number' min="0" label={{content : "Days", color : "blue"}} labelPosition='right'/>
            </Form.Field>
        </Form.Group>
        <Form.Field>
          <h3>Add Item</h3>
        </Form.Field>
        <Form.Group>
          <Form.Field width={2}>
              <label htmlFor="discount">Discount</label>
              <Input id="discount" min="00.00" step=".01" type='number' label={{icon: "percent", color : "blue"}} labelPosition='right'/>
          </Form.Field>
          <Form.Field>
              <label htmlFor="manufacturingDate">Manufacturing Date</label>
              <Input id="manufacturingDate" type='date' value="2023-01-23" readOnly/>
          </Form.Field>
          <Form.Field>
              <label htmlFor="ExpirationDate">Expiration Date</label>
              <Input id="ExpirationDate" type='date' value="2023-01-23" readOnly/>
          </Form.Field>
          <Form.Field>
            {/* <Dropdown
              search
              selection
              options={}
            /> */}
          </Form.Field>
        </Form.Group>
      </Form>
    </>
  )
}
