import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Container, Dropdown, Form, FormField, Header, Input, Label, SemanticCOLORS } from 'semantic-ui-react'
import Itable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { faChessBishop } from '@fortawesome/free-solid-svg-icons'
import { CollectionData, ClientInfo, Option, CheckInfo, RawDataOfProcessPayment } from 'types'
import { HOSTADDRESS, PORT, calculateDueDate, fetchBalance, formatCurrency, getDate, handleDateChange, handleOnChange, hasEmptyFields, renderPaymentStatus, find } from 'functions'
import { PAYMENT, PAYMENT_STATUS } from '@prisma/client'
import { useRouter } from 'next/router'




export const getServerSideProps : GetServerSideProps = async (context) => {
    

    const session = await getSession(context);
    const usr = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

    const documentData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/accounting/docs/${context.query.id}/${context.query.docs}`)
    const clients = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/client`)


    const paymentData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/collection/${documentData.data.data.client.clientInfo.id}/${documentData.data.data.id}`)

    
    
    return {
      props : {user : usr.data.data, documentData : documentData.data.data, clients : clients.data.data, paymentData : paymentData.data.data}
    }
}



const modeOfPayementOptions : Option[] = [
    { id: 'modeOfPayment', key : "check", value : PAYMENT.CHECK, text : "Check"},
    { id: 'modeOfPayment', key : "cash", value : PAYMENT.CASH, text : "Cash"}
 
]

const headerTitles = ["id","Method","Check No.", "CR/AR No.", "SI/DR No.","Check Date", "Date of Deposit", "Deposit Time", "Amount", "EWT", "Status", "From Balance", "Remarks", " Actions "]



export default function add({ user, documentData, clients, paymentData} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    const router = useRouter()

 
    const [modeOfPayment, setModeOfPayment] = useState("")
    const [tableData, setTableData] = useState([])
    const [deductFromBalance, setdeductFromBalance] = useState(false)
    const [balance, setBalance] = useState(0)
    const [isEditing, setIsEditing] = useState(false)
    const [del, setDel] = useState(false)

    const [rawData, setRawData] = useState<RawDataOfProcessPayment>(
        {
            id : '',
            checkNumber : '',
            checkDate : '',
            ARCR : '',
            depositTime : '',
            amount : 0.00,
            ewt : 0.00,
            balance : 0.00,
            dateOfDeposit : '',
            modeOfPayment : modeOfPayment,
            documentData : documentData,
            dateIssued : '',
            deductFromBalance : false,
            remarks : '',
            prevAmount : 0.00,
            prevBal : 0.00,
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
                checkNumber : check.checkNumber || '-',
                ARCRNo : check.CRARNo ? check.CRARNo : '-',
                [`${number}`]: check.salesInvoice ? check.salesInvoice.salesInvoiceNumber : check.deliveryRecipt.deliveryReciptNumber,
                checkDate : check.checkDate ? check.checkDate.substring(10, 0): '-',
                depositDate : check.depositDateAndTime  === "-" ? "-" : check.depositDateAndTime.substring(10, 0),
                depositTime : check.modeOfPayment === PAYMENT.CASH ? '-' : check.depositDateAndTime === "-" ? "-" : new Date(check.depositDateAndTime).toLocaleTimeString(),
                amount : formatCurrency((Math.round(parseFloat(check.amount) * 100) / 100).toString()),
                ewt : formatCurrency((Math.round(parseFloat(check.ewt) * 100) / 100).toString()),
                status : renderPaymentStatus(check.status),
                fromBalance : formatCurrency(check.fromBalance),
                remarks : check.remarks,
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

        if(modeOfPayment === PAYMENT.CASH){
            if( rawData.dateOfDeposit === ''){
                alert('There are empty fields')
                return
            }
        }else{
            if(hasEmptyFields(rawData, ['id', 'amount', 'ewt', 'prevAmount', 'prevBal','balance', 'remarks'])){
                alert('There are empty fields')
                return
            }

            if(rawData.amount <= 0 && !rawData.deductFromBalance){
                alert('There are empty fields')
                return
            }
        }

        try {
            const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/collection`, rawData)
            
            router.reload()
        } catch (error) {
            console.log(error)
        }
    }

    async function handleSaveChanges(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
        e.preventDefault()

        if(modeOfPayment === PAYMENT.CASH){
            if( rawData.dateOfDeposit === ''){
                alert('There are empty fields')
                return
            }
        }else{
            if(hasEmptyFields(rawData, ['id', 'amount', 'ewt', 'prevAmount', 'prevBal','balance', 'remarks'])){
                
                alert('There are empty fields')
                return
            }

            if(rawData.amount <= 0 && !rawData.deductFromBalance){
                alert('There are empty fields')
                return
            }
        }

        try {
            const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/collection/save`, rawData)
            
            router.reload()
        } catch (error) {
            console.log(error)
        }
    }

    function updateItem(data : any) {
        setIsEditing(true)
        const paymentInfo = find(data.id, paymentData)
        const { id, CRARNo, amount, checkDate, checkNumber, dateIssued, depositDateAndTime, ewt, modeOfPayment, remarks, fromBalance} = paymentInfo
        setRawData({
            id : id,
            amount : Number(amount),
            ARCR : CRARNo,
            checkDate : checkDate ? checkDate.substring(10, 0) : "",
            checkNumber : checkNumber,
            dateIssued : dateIssued.substring(10, 0),
            dateOfDeposit : depositDateAndTime.substring(10, 0),
            depositTime : depositDateAndTime,
            deductFromBalance : Number(fromBalance) > 0 ? true : false,
            ewt : Number(ewt),
            balance : Number(fromBalance),
            remarks : remarks,
            modeOfPayment : modeOfPayment,
            documentData : documentData,
            prevAmount : Number(amount) + Number(ewt),
            prevBal : Number(fromBalance)
        })
    }

    async function handleDelete(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
        e.preventDefault()

        try {
            const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/collection/delete`, rawData)
        } catch (error) {
            console.log(error)
        }
        
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
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>SI/DR#: {<p className='tw-font-bold'>{documentData.salesInvoiceNumber !== undefined ? documentData.salesInvoiceNumber : documentData.deliveryReciptNumber}</p>}</h1>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>Total Amount Due: {<p className='tw-text-green-700 tw-font-bold'>₱ {formatCurrency(documentData.payables)}</p>}</h1>
                            <h1 className='tw-text-lg tw-flex tw-gap-2 tw-items-center'>SI/DR Issued Amount: {<p className='tw-text-green-700 tw-font-bold'>₱ {formatCurrency(documentData.totalAmount)}</p>}</h1>

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
                        <label htmlFor="ARCR">AR/CR No.</label>
                        <Input id='ARCR' type='text' value={rawData.ARCR} onChange={(e) => {handleOnChange(e, rawData, setRawData)}}/>
                    </Form.Field>
                    <Form.Field>
                            <label htmlFor="dateIssued">AR/CR Date</label>
                            <Input id='dateIssued' value={rawData.dateIssued.substring(10, 0) || ""} max={getDate()} type='date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                    </Form.Field>
                    <Form.Field width={2}>
                        <label htmlFor="checkNumber">Check No.</label>
                        <Input id='checkNumber' value={rawData.checkNumber} type='text' onChange={(e) => {handleOnChange(e, rawData, setRawData)}}/>
                    </Form.Field>
                    <Form.Field>
                            <label htmlFor="checkDate">Check Date</label>
                            <Input id='checkDate' value={rawData.checkDate.substring(10, 0) || ""} type='date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                        </Form.Field>
                </Form.Group>
                <Form.Group>        
                        <Form.Field>
                            <label htmlFor="dateOfDeposit">Deposit Date</label>
                            <Input id='dateOfDeposit' value={rawData.dateOfDeposit.substring(10, 0) || ""} type='date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="checkDate">Deposit Time</label>
                            <Input id='checkDate' value={rawData.depositTime.substring(11, 19) || ""} type='time' step='1' onChange={(e) => {
                                setRawData({...rawData, depositTime : `${rawData.dateOfDeposit.substring(10,0)}T${e.target.value}:00Z`})}}/>
                        </Form.Field>
                        <Form.Field width={2}>
                            <label htmlFor="amount">Amount</label>
                            <Input id='amount' value={rawData.amount} onChange={(e) => {handleOnChange(e, rawData, setRawData)}} type='number' label={{content : "₱", color : 'blue'}}/>
                        </Form.Field>
                        <Form.Field width={2}>
                            <label htmlFor="ewt">EWT</label>
                            <Input id='ewt' value={rawData.ewt} onChange={(e) => {handleOnChange(e, rawData, setRawData)}} type='number' label={{content : "₱", color : 'blue'}}/>
                        </Form.Field>
                        <Form.Field >
                            <label htmlFor="remarks">Remarks</label>
                            <Input id='remarks' value={rawData.remarks || ""} type='text' onChange={(e) => {handleOnChange(e, rawData, setRawData)}}/>
                        </Form.Field>   
                    </Form.Group>
                    {!isEditing ? <Button onClick={(e) => {handleOnClick(e)}} color='blue'>Add Payment</Button>  : <div className='tw-flex tw-gap-4'><Button onClick={(e) => {handleSaveChanges(e)}} color='blue'>Save Changes</Button><Button onClick={(e) => {setIsEditing(false)}} color='google plus'>+ Add Payment</Button>
                    {!del ?  <Button className='' color='red' inverted onClick={() => { setDel(true)}}>Delete</Button> : null}
                    
                    {del ? <div className='tw-flex-col tw-justify-end'>
                            <Header as='h5' className='tw-pr-2'>Are you sure to delete?</Header>
                            <div className='tw-flex'>
                                <Button className='' color='red' inverted onClick={(e) => { handleDelete(e)}}>Yes</Button> 
                                <Button className='' color='blue' inverted onClick={() => { setDel(false)}}>No</Button>
                            </div>
                    </div>: null}
                    
                    </div>} 

                </>
                : 
                    modeOfPayment === PAYMENT.CASH ?

                    <>
                        <div className='tw-flex tw-gap-8'>  
                                <Form.Group>
                                    <Form.Field >
                                        <label htmlFor="checkNumber">Recipt No.</label>
                                        <Input id='checkNumber' value={rawData.checkNumber} type='text' onChange={(e) => {handleOnChange(e, rawData, setRawData)}}/>
                                    </Form.Field>
                                    <Form.Field>
                                        <label htmlFor="dateOfDeposit">Deposit Date</label>
                                        <Input id='dateOfDeposit' value={rawData.dateOfDeposit.substring(10, 0) || ""} type='date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                                    </Form.Field>
                                    <Form.Field>
                                        <label htmlFor="dateIssued">Date Issued</label>
                                        <Input id='dateIssued' value={rawData.dateIssued.substring(10, 0) || ""} max={getDate()} type='date' onChange={(e) => {handleDateChange(e, rawData, setRawData)}}/>
                                    </Form.Field>
                                    <Form.Field>
                                        <label htmlFor="amount">Amount</label>
                                        <Input id='amount' value={rawData.amount} min='0' onChange={(e) => {handleOnChange(e, rawData, setRawData)}} type='number' label={{content : "₱", color : 'blue'}}/>
                                    </Form.Field>
                                    <Form.Field >
                                        <label htmlFor="ewt">EWT</label>
                                        <Input id='ewt' value={rawData.ewt} onChange={(e) => {handleOnChange(e, rawData, setRawData)}} type='number' label={{content : "₱", color : 'blue'}}/>
                                    </Form.Field>
                                    <Form.Field >
                                        <label htmlFor="remarks">Remarks</label>
                                        <Input id='remarks' value={rawData.remarks || ""} type='text' onChange={(e) => {handleOnChange(e, rawData, setRawData)}}/>
                                    </Form.Field>
                            </Form.Group>
                        </div>

                        {!isEditing ? <Button onClick={(e) => {handleOnClick(e)}} color='blue'>Add Payment</Button>  : <div className='tw-flex tw-gap-4'><Button onClick={(e) => {handleSaveChanges(e)}} color='blue'>Save Changes</Button><Button onClick={(e) => {setIsEditing(false)}} color='google plus'>+ Add Payment</Button>
                            {!del ?  <Button className='' color='red' inverted onClick={() => { setDel(true)}}>Delete</Button> : null}
                        
                            {del ? <div className='tw-flex-col tw-justify-end'>
                                    <Header as='h5' className='tw-pr-2'>Are you sure to delete?</Header>
                                    <div className='tw-flex'>
                                        <Button className='' color='red' inverted onClick={(e) => { handleDelete(e)}}>Yes</Button> 
                                        <Button className='' color='blue' inverted onClick={() => { setDel(false)}}>No</Button>
                                    </div>
                            </div>: null}
                        </div>} 
                        

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
            <Itable data={tableData} allowEditing={true}  updateItem={updateItem} headerTitles={headerTitles} allowDelete={false} />
          </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
          <div className='tw-w-[90%]'>
            
          </div>
        </div>
    </div>
  )
}
