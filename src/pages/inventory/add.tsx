import React, { useEffect, useState } from 'react'
import { Button, Container, Dropdown, Form, FormField, Input, Label } from 'semantic-ui-react'
import Itable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import { faChessBishop } from '@fortawesome/free-solid-svg-icons'

enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    PER_PIECE = 'PER_PIECE',
  }

interface Doc {
    id : string,
    doc : string
}

interface Client{
    id          :String
    companyName :String 
    address     :String
    TIN         :String 
  }

  const quantityOptions = [
    { key:'vial' , value : UNITS.VIALS, text : 'Vial/s'},
    { key:'box' , value : UNITS.BOX, text : 'Box/s'},
    { key:'bottle' , value : UNITS.BOTTLES, text : 'Bottle/s'},
    { key:'piece' , value : UNITS.PER_PIECE, text : 'Piece/s'}
  
]

const stockSelection = [
    { key:'in' , value : "in", text : 'In'},
    { key:'out' , value : "out", text : 'Out'},
]

export const getServerSideProps : GetServerSideProps = async (context) => {
    

    const session = await getSession(context);
    const usr = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)

    const docsId = await axios.get(`http://localhost:3000/api/getInfo/accounting/docs/`)

    
    
    return {
      props : {user : usr.data.data, docsId : docsId.data.data}
    }
}


export default function add({ user, docsId} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [disabled1, setDisabled1] = useState(true)
    const [disabled2, setDisabled2] = useState(true)
    const [doc, setDoc] = useState({
        id : '',
        doc : ''
    })
    const [ItemInfo, setItemInfo] = useState<any>()

    const [items , setItem] = useState({
        id : undefined,
        currentDate : '',
        client : {
            clientInfo : {
                companyName : ''
            }
        },
        items : []
    })
    const [ID, setID] = useState('')
    const options = docsId.map((item : any) => {
        return { key: item.id , value : item.id, text : item.doc + " : " + item.id}
    })
    

    useEffect(() => {
        if(ID !== ''){
            setDoc(docsId.find((item : Doc) => {
                return item.id === ID
            }))
        }
        return
    }, [ID])


    useEffect(() => {
        if(doc.id !== ''){
            fetchDetails(doc)
        }
        return
    }, [doc])

    useEffect(()=>{
        if(items.id !== undefined){
            setDisabled1(false)
            
        }
    }, [items]) 
    
    useEffect(() => {
        if(ItemInfo !== undefined){
            setDisabled2(false)
            console.log(ItemInfo)
        }
    }, [ItemInfo])

    function getUnit(unit : UNITS) : string{
        switch(unit){
            case UNITS.BOTTLES : 
                return "Bottle/s"
            case UNITS.BOX : 
                return "Box/es" 
            case UNITS.PER_PIECE :
                return "Piece/s"
            case UNITS.VIALS : 
                return "Vial/s"
            default : 
                return ""
        }
    }

    function getStocks(unit : UNITS, itemInfo : any) : number {
        switch(unit){
            case UNITS.BOTTLES : 
            return parseFloat(itemInfo.stocksBottle)
        case UNITS.BOX : 
            return parseFloat(itemInfo.stocksBox)
        case UNITS.PER_PIECE :
            return parseFloat(itemInfo.stocksPiece)
        case UNITS.VIALS : 
            return parseFloat(itemInfo.stocksVial)
        default : 
            return 0
        }
    }
    

    async function fetchDetails(doc : Doc) {
        try {
            const res = await axios.get(`http://localhost:3000/api/getInfo/accounting/docs/${doc.id}/${doc.doc}`)
            setItem(res.data.data)
        } catch (error) {
            console.log(error)
        }
    }
 
  return (
    <div className='tw-h-screen tw-w-full'>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%]  tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[90%] tw-rounded-tl-lg tw-rounded-tr-lg'>
                <Form>
                <Form.Field>
                    <h1 className='tw-font-bold tw-text-2xl'>Inventory Report</h1>
                </Form.Field>
                    
                    <Form.Group>
                            <Form.Field width={5}>
                            <Dropdown
                            id = 'companyName'
                            placeholder='--Company Name--'
                            search
                            selection
                            options={options}
                            onChange={(e, item) => {setID(item.value === undefined ? '' : item.value.toString())}}  
                        />
                        </Form.Field>
                        <Form.Field width={5}>
                            <Input type='date' readOnly value={items.currentDate.substring(10, 0)} disabled={disabled1} label={{color : 'blue', content : "Date Issued: "}}/>
                        </Form.Field>
                        <Form.Field width={5}>
                            <Input type='text' readOnly value={items.client.clientInfo.companyName} disabled={disabled1} label={{color : 'blue', content : "Client's Name"}}/>
                        </Form.Field>
                    </Form.Group>
                    <Form.Group>
                        <Form.Field width={5}>
                            <Dropdown
                            disabled = {disabled1}
                            id = 'companyName'
                            placeholder='--Item Name-'
                            search
                            selection
                            options={items.items.map((item : any) => {
                                return { key: item.id , value : item.id, text : item.ItemInfo.itemName}
                            })}
                            onChange={(e, item) => {setItemInfo(items.items.find((i : any) => {
                                return i.id === item.value
                            }) )}}  
                        />
                        </Form.Field>
                        <Form.Field width={5}>
                            <Input  readOnly value={ItemInfo !== undefined ? ItemInfo.quantity : ''} disabled={disabled2} labelPosition='right' type='text' placeholder='0'>
                                <Label color='blue'><Dropdown basic
                                    compact
                                    id = 'companyName'
                                    placeholder='Stock'
                                    options={stockSelection}  
                                /></Label>
                                <input />
                                <Label>{getUnit(ItemInfo !== undefined ? ItemInfo.unit : "")}</Label>
                            </Input>
                        </Form.Field>
                        <Form.Field width={5}>
                            <Input readOnly value={getStocks(ItemInfo !== undefined ? ItemInfo.unit : "", ItemInfo !== undefined ? ItemInfo.ItemInfo : "" )} disabled={disabled2} labelPosition='left' type='text' placeholder='Amount'>
                                <Label color='blue'>Remaining</Label>
                                <input />
                                <Label>{getUnit(ItemInfo !== undefined ? ItemInfo.unit : "")}</Label>
                            </Input>
                        </Form.Field>
                    </Form.Group>
                    
                </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-justify-center'>
          <div className='tw-w-[90%]'>
            <Itable data={[]} headerTitles={["id", "test"]} allowDelete={false} />
          </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
          <div className='tw-w-[90%]'>
             <Button onClick={() => {console.log("Hi")}} color='blue'>Create Inventory Report</Button>
          </div>
        </div>
    </div>
  )
}
