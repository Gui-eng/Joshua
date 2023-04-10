import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Container, Dropdown, Form, FormField, Header, Input, Label, SemanticCOLORS } from 'semantic-ui-react'
import Itable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { faChessBishop } from '@fortawesome/free-solid-svg-icons'
import { CollectionData, ClientInfo, Option, CheckInfo, RawDataOfProcessPayment } from 'types'
import { calculateDueDate, fetchBalance, formatCurrency, getDate, handleDateChange, handleOnChange, hasEmptyFields, renderPaymentStatus } from 'functions'
import { PAYMENT, PAYMENT_STATUS } from '@prisma/client'
import { useRouter } from 'next/router'



export const getServerSideProps : GetServerSideProps = async (context) => {
    

    const session = await getSession(context);
    const usr = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)

    const documentData = await axios.get(`http://localhost:3000/api/getInfo/accounting/docs/${context.query.id}/${context.query.docs}`)
    const clients = await axios.get(`http://localhost:3000/api/getInfo/client`)


    const paymentData = await axios.get(`http://localhost:3000/api/collection/${documentData.data.data.client.clientInfo.id}/${documentData.data.data.id}`)

    
    
    return {
      props : {user : usr.data.data, documentData : documentData.data.data, clients : clients.data.data, paymentData : paymentData.data.data}
    }
}



const modeOfPayementOptions : Option[] = [
    { id: 'modeOfPayment', key : "check", value : PAYMENT.CHECK, text : "Check"},
    { id: 'modeOfPayment', key : "cash", value : PAYMENT.CASH, text : "Cash"}
 
]

const headerTitles = ["id","Method", "CR No.", "SI/DR No.", "Date Issued","Check Date", "Date of Deposit", "Deposit Time", "Amount", "Status", "From Balance"]



export default function add({ user, documentData, clients, paymentData} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    const router = useRouter()

 
    const [modeOfPayment, setModeOfPayment] = useState("")
    const [tableData, setTableData] = useState([])
    const [deductFromBalance, setdeductFromBalance] = useState(false)
    const [balance, setBalance] = useState(0)

    const [rawData, setRawData] = useState<RawDataOfProcessPayment>(
        {
            checkNumber : '',
            checkDate : '',
            depositTime : '',
            amount : 0.00,
            dateOfDeposit : '',
            modeOfPayment : modeOfPayment,
            documentData : documentData,
            dateIssued : '',
            deductFromBalance : false
        }
    )

    useEffect(() => {
        setRawData({...rawData, deductFromBalance : deductFromBalance})
    }, [deductFromBalance])


    useEffect(() => {   
        if(paymentData.length > 0 ){
            setTableData(paymentData.map((check : any) => {

            const number = check.salesInvoice !== null ? 'salesInvoiceNumber' : 'deliveryReciptNumber'
            return {
                id : check.id,
                modeOfPayment : check.modeOfPayment,
                checkNumber : check.modeOfPayment === 'CASH' ? "-" : check.checkNumber !== '' ? check.checkNumber : '-',
                [`${number}`]: check.salesInvoice ? check.salesInvoice.salesInvoiceNumber : check.deliveryRecipt.deliveryReciptNumber,
                dateIssued : check.dateIssued.substring(10, 0),
                checkDate : check.checkDate ? check.checkDate.substring(10, 0): '-',
                depositDate : check.depositDateAndTime  === "-" ? "-" : check.depositDateAndTime.substring(10, 0),
                depositTime : check.modeOfPayment === PAYMENT.CASH ? '-' : check.depositDateAndTime === "-" ? "-" : new Date(check.depositDateAndTime).toLocaleTimeString(),
                amount : (Math.round(parseFloat(check.amount) * 100) / 100).toLocaleString(),
                status : renderPaymentStatus(check.status),
                fromBalance : check.fromBalance
            }

         }))
        }

        const fetchBal = async () => {
            const bal = await fetchBalance(documentData.client.clientInfo.id)
            setBalance(bal)
        }
        fetchBal()
    }, [])

    

    useEffect(() => {
        if(modeOfPayment === PAYMENT.CASH){
            setRawData({...rawData,
                checkDate : '',
                checkNumber : '',
                depositTime : '',
                modeOfPayment : PAYMENT.CASH
            })
        }else{
            setRawData({
                ...rawData,
                modeOfPayment : PAYMENT.CHECK
            })
        }
    }, [modeOfPayment])


    async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
        e.preventDefault()

        console.log(rawData)
        if(modeOfPayment === PAYMENT.CASH){
            if(rawData.amount === 0 || rawData.dateOfDeposit === ''){
                alert('There are empty fields')
                return
            }
        }else{
            if(hasEmptyFields(rawData)){
                alert('There are empty fields')
                return
            }
        }

        const res = await axios.post(`http://localhost:3000/api/collection`, rawData)

        router.reload()
    }

    

    
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
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>Company Name: {<p className='tw-font-bold'>{documentData.client.clientInfo.companyName}</p>}</h1>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>SI#: {<p className='tw-font-bold'>{documentData.salesInvoiceNumber !== undefined ? documentData.salesInvoiceNumber : documentData.deliveryReciptNumber}</p>}</h1>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>Account Payables: {<p className='tw-text-green-700 tw-font-bold'>₱ {formatCurrency(documentData.payables)}</p>}</h1>
                        </div>
                        <div>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>Date Issued: {<p className='tw-font-bold'>{documentData.dateIssued.substring(10, 0)}</p>}</h1>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>Due Date: {<p className='tw-font-bold'>{calculateDueDate(documentData)}</p>}</h1>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>Account Balance: {<p className='tw-text-green-700 tw-font-bold'>₱ {formatCurrency(balance.toString())}</p>}</h1>
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
                    disabled = {documentData.isPaid}
                    onChange={(e, item) => {setModeOfPayment(item.value !== undefined ? item.value.toString() : '')}}
                    />
                </Form.Field>
              
                {modeOfPayment === PAYMENT.CHECK ? 
                <>
                <Form.Group>
                    <Form.Field width={2}>
                        <label htmlFor="checkNumber">Check No.</label>
                        <Input id='checkNumber' type='text' onChange={(e) => {handleOnChange(e, rawData, setRawData)}}/>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="checkDate">Check Date</label>
                        <Input id='checkDate' type='date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="dateOfDeposit">Deposit Date</label>
                        <Input id='dateOfDeposit' type='date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="checkDate">Deposit Time</label>
                        <Input id='checkDate' type='time' onChange={(e) => {setRawData({...rawData, depositTime : `${rawData.dateOfDeposit.substring(10,0)}T${e.target.value}:00Z`})}}/>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="dateIssued">Date Issued</label>
                        <Input id='dateIssued' max={getDate()} type='date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                    </Form.Field>
                    <Form.Field width={2}>
                        <label htmlFor="amount">Amount</label>
                        <Input id='amount'  onChange={(e) => {handleOnChange(e, rawData, setRawData)}} type='number' label={{content : "₱", color : 'blue'}}/>
                    </Form.Field>
                   
                    
                </Form.Group>
                <Button color='blue'  onClick={(e) => {handleOnClick(e)}}>Add Payment</Button>
                </>
                : 
                    modeOfPayment === PAYMENT.CASH ?

                    <>
                        <div className='tw-flex tw-gap-8'>  
                            <Form.Field width={2}>
                                <label htmlFor="amount">Amount</label>
                                <Input onChange={(e) => {handleOnChange(e, rawData, setRawData)}} id='amount' type='number' label={{content : "₱", color : 'blue'}}/>
                            </Form.Field>
                            <Form.Field>
                                <label htmlFor="dateIssued">Date Issued</label>
                                <Input id='dateIssued'type='date'  max={getDate()} onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                            </Form.Field>
                            <Form.Field>
                                <label htmlFor="dateOfDeposit">Deposit Date</label>
                                <Input id='dateOfDeposit' type='date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                            </Form.Field>
                            
                        </div>

                        <Button onClick={(e) => {handleOnClick(e)}} color='blue'>Add Payment</Button>   
                    </>
                    : null
                }
                {
                        (balance > 0 && !documentData.isPaid) ?
                        <div className='tw-py-4'>
                                <Checkbox 
                            label = {<label>{!deductFromBalance ? <Header as={'h5'} color='grey'>Deduct from balance</Header> : <Header as={'h5'}>Deduct from balance</Header>}</label>}
                            onChange={() => {setdeductFromBalance(deductFromBalance ? false : true)}}
                            toggle/>
                        </div> : null
                        
                }
                </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-justify-center'>
          <div className='tw-w-[90%]'>
            <Itable data={tableData} headerTitles={headerTitles} allowDelete={false} />
          </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
          <div className='tw-w-[90%]'>
            
          </div>
        </div>
    </div>
  )
}
