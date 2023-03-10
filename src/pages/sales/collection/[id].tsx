import React, { useEffect, useState } from 'react'
import { Button, Container, Dropdown, Form, FormField, Header, Input, Label } from 'semantic-ui-react'
import Itable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { CollectionData, ClientInfo } from 'types'
import { useRouter } from 'next/router'









export const getServerSideProps : GetServerSideProps = async (context) => {
    

    const session = await getSession(context);
    const usr = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)


    const clients = await axios.get(`http://localhost:3000/api/getInfo/client`)
    
    
    return {
      props : {user : usr.data.data, clients : clients.data.data}
    }
}

const headerTitles = ["id", "SI No.", "Client's Name", "Date Issued", "Due Date", "Amount Due", "Amount Paid", "Balance", "Status", "Action"]

const sample : CollectionData[]= [{
    id : "dfjgkdlsfjg",
    salesInvoiceNumber : "89901",
    clientsName : "Super H. Drug",
    dateIssued : "2023-03-06T02:00:00Z",
    amountDue : 10000,
    balance : 8000,
    amountPaid : 2000,
    terms : 90

},
{
    id : "dfjgkdlsfjg1",
    salesInvoiceNumber : "89902",
    clientsName : "Super H. Drug",
    dateIssued : "2023-03-07T02:00:00Z",
    amountDue : 12000,
    balance : 2000,
    amountPaid : 14000,
    terms : 30,
}
]


const categoryOption = [
    { key:'paid' , value : "unpaid", text : 'Unpaid'},
    { key:'unpaid' , value : "paid", text : 'Paid'},
    { key:'both' , value : "both", text : 'Unpaid/Paid'},

]


export default function add({ user, clients} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [client, setClient] = useState(clients.map((client : ClientInfo) => {
        return {
            key : client.id,
            value : client.id,
            text : client.companyName
        }
    }))

    const router = useRouter()

    const sampleData = sample.map((item : CollectionData) => {
        const date = new Date(item.dateIssued)
        date.setDate(date.getDate() + item.terms)
        const dueDate = date.toISOString().substring(10, 0)

        return {
            id : item.id,
            salesInvoiceNumber : item.salesInvoiceNumber,
            clientsName : item.clientsName,
            dateIssued : item.dateIssued.substring(10, 0),
            dueDate : dueDate,
            amountDue : <p className={`tw-text-red-600 tw-font-bold`}>{item.amountDue.toLocaleString()}</p>,
            amountPaid : <p>{item.amountPaid.toLocaleString()}</p>,
            balance : <p className={`${item.amountDue < item.amountPaid ? 'tw-text-green-500' : 'tw-text-red-500'} tw-font-bold`}>{item.balance.toLocaleString()}</p>,
            status : item.amountDue < item.amountPaid ?  <p className='tw-text-green-600 tw-w-full tw-h-full'>Overpaid</p> : <p className='tw-text-yellow-700'>Pending Payment</p>,
            action : <Button onClick={() => {router.push('/sales/collection/processPayment/1')}} color='blue'>Process Payment</Button>
        }
    })
 
  return (
    <div className='tw-h-screen tw-w-full'>
        <div className='tw-m-4'>
                    <Button onClick={() => {router.push('/sales/')}} color='blue' >Home</Button>
        </div>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%]  tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[90%] tw-rounded-tl-lg tw-rounded-tr-lg'>
                <Form>
                <Form.Field>
                    <h1 className='tw-font-bold tw-text-2xl'>Collection Info</h1>
                </Form.Field>
               <Form.Group>
                <Form.Field>
                        <label htmlFor="salesInvoiceNumber">SI#</label>
                        <Dropdown
                                id = 'salesInvoiceNumber'
                                placeholder='ie. 89901'
                                search
                                selection
                                options={client}
                            />
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="salesInvoiceNumber">Clients Name</label>
                        <Dropdown
                                id = 'companyName'
                                placeholder='--Company Name--'
                                search
                                selection
                                options={client}
                            />
                    </Form.Field>
               </Form.Group>
                    <Form.Field >
                        <div className='tw-flex tw-gap-4 tw-items-center'>
                            <h1 className='tw-text-lg tw-font-bold'>Current Balance:</h1>
                            <p className='tw-text-green-600 tw-text-lg tw-font-bold'>₱ {"2,000"}</p>
                        </div>
                    </Form.Field>
                    <Form.Field className='tw-float-right'>
                        <Dropdown
                                id = 'companyName'
                                defaultValue={"Unpaid"}
                                search
                                selection
                                options={categoryOption}
                            />
                    </Form.Field>
                
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
