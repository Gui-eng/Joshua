import React, { useEffect, useState } from 'react'
import { Button, Container, Dropdown, Form, FormField, Header, Input, Label } from 'semantic-ui-react'
import Itable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { faChessBishop } from '@fortawesome/free-solid-svg-icons'
import { CollectionData, ClientInfo, Option, CheckInfo } from 'types'



export const getServerSideProps : GetServerSideProps = async (context) => {
    

    const session = await getSession(context);
    const usr = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)

    const docsId = await axios.get(`http://localhost:3000/api/getInfo/accounting/docs/`)
    const clients = await axios.get(`http://localhost:3000/api/getInfo/client`)
    
    
    return {
      props : {user : usr.data.data, docsId : docsId.data.data, clients : clients.data.data}
    }
}

const headerTitles = ["id","Method", "CR No.", "SI No.", "Date Issued", "Date of Deposit", "Deposit Time", "Amount"]

const sample : CheckInfo[] = [
    {
        id : "sadfasdf",
        method : "Check",
        checkNumber : "1102",
        salesInvoiceNumber : "89901",
        checkIssued : "2023-03-07T02:00:00Z",
        checkDepositDate : "2023-03-07T02:00:00Z",
        depositTime : "2023-03-07T08:32:01Z",
        amount : 4000
    },
    {
        id : "sadfasdf1",
        method : "Cash",
        checkNumber : "-",
        salesInvoiceNumber : "89901",
        checkIssued : "2023-03-07T02:00:00Z",
        checkDepositDate : "-",
        depositTime : "-",
        amount : 4000
    }
]

const modeOfPayementOptions : Option[] = [
    { key : "check", value : "check", text : "Check"},
    { key : "cash", value : "cash", text : "Cash"}

]




export default function add({ user, docsId, clients} : InferGetServerSidePropsType<typeof getServerSideProps>) {


    const [client, setClient] = useState(clients.map((client : ClientInfo) => {
        return {
            key : client.id,
            value : client.id,
            text : client.companyName
        }
    }))

    const sampleData = sample.map((check : CheckInfo) => {
        return {
            id : check.id,
            method : check.method,
            checkNumber : check.checkNumber,
            salesInvoiceNumber : check.salesInvoiceNumber,
            dateIssued : check.checkIssued.substring(10, 0),
            depositDate : check.checkDepositDate === "-" ? "-" : check.checkDepositDate.substring(10, 0),
            depositTime : check.depositTime === "-" ? "-" : new Date(check.depositTime).toLocaleTimeString(),
            amount : check.amount
        }
    })

    const [modeOfPayment, setModeOfPayment] = useState("")
 
  return (
    <div className='tw-h-screen tw-w-full'>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%]  tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[90%] tw-rounded-tl-lg tw-rounded-tr-lg'>
                <Form>
                <Form.Field>
                    <h1 className='tw-font-bold tw-text-2xl'>Payment Processing</h1>
                </Form.Field>

                <Form.Field>
                    <div className='tw-flex tw-justify-between'>
                        <div>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>Company Name: {<p className='tw-font-bold'>Super H. Drug</p>}</h1>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>SI#: {<p className='tw-font-bold'>89901</p>}</h1>
                        </div>
                        <div>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>Date Issued: {<p className='tw-font-bold'>2023-03-06</p>}</h1>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>Due Date: {<p className='tw-font-bold'>2023-06-04</p>}</h1>
                        </div>
                    </div>
                </Form.Field>
                <Form.Field width={2}>
                    <label> Mode of Payement</label>
                    <Dropdown
                    fluid
                    options={modeOfPayementOptions}
                    selection
                    selectOnBlur
                    onChange={(e, item) => {setModeOfPayment(item.value !== undefined ? item.value.toString() : '')}}
                    />
                </Form.Field>
                {modeOfPayment === "check" ? 
                <>
                <Form.Group>
                    <Form.Field width={2}>
                        <label htmlFor="checkNumber">Check No.</label>
                        <Input id='checkNumber' type='text'/>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="checkDate">Check Date</label>
                        <Input id='checkDate' type='date'/>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="checkDate">Deposit Time</label>
                        <Input id='checkDate' type='time'/>
                    </Form.Field>
                    <Form.Field width={2}>
                        <label htmlFor="checkAmount">Amount</label>
                        <Input id='checkAmount' type='number' label={{content : "₱", color : 'blue'}}/>
                    </Form.Field>
                    
                </Form.Group>
                <Button color='blue'>Add Payment</Button>
                </>
                : 
                    modeOfPayment === 'cash' ?
                    <>  
                        <Form.Field width={2}>
                            <label htmlFor="checkAmount">Amount</label>
                            <Input id='checkAmount' type='number' label={{content : "₱", color : 'blue'}}/>
                        </Form.Field>
                        <Button color='blue'>Add Payment</Button>
                    </>
                    
                    : null
                }
                
                </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-justify-center'>
          <div className='tw-w-[90%]'>
            <Itable data={sampleData} headerTitles={headerTitles} allowDelete={false} editing={false}/>
          </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
          <div className='tw-w-[90%]'>
            
          </div>
        </div>
    </div>
  )
}
