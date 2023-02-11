import axios from 'axios'
import _, { floor, uniqueId } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import IFlexTable from '../../../../components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Form, FormField, Input, Message } from 'semantic-ui-react'

const quantityOptions = [
  { key:'vial' , value : 'VIALS', text : 'Vial/s'},
  { key:'box' , value : 'BOX', text : 'Box/s'},
  { key:'bottle' , value : 'BOTTLES', text : 'Bottle/s'},
  { key:'piece' , value : 'PER PIECE', text : 'Piece/s'}

]

const tableHeaders = ["id","QTY", "UNIT", "ARTICLES", "VATABLE", "U-PRICE", "DISCOUNT", "AMOUNT"]

interface Client{
  id          :String
  companyName :String 
  address     :String
  TIN         :String 
}

enum UNITS {
  BOX = 'BOXES',
  VIALS = 'VIALS',
  BOTTLES = 'BOTTLES',
  PER_PIECE = 'PER_PIECE',
}

interface Items {
  id                :String  
  itemName          :String
  batchNumber       :String 
  manufacturingDate :String
  ExpirationDate    :String
  priceBottle       :Number
  priceVial         :Number
  pricePiece        :Number
  VAT               :Boolean
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

const headerTitles = ["id", "itemId", "Company Name", "Company Address", "TIN"]

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

  const testItems = [
    {
      VAT: "Yes",
      amount : 60,
      article: "Biogesic",
      discount: 12,
      id: "20bd3839-3104-4199-8668-b646a27404cf",
      itemId: "cf5655fe-be78-41c1-8f7e-1c4728d46410",
      quantity: 12,
      uPrice: 5,
      unit: UNITS.PER_PIECE
    },
    {
      VAT: "No",
      amount : 60,
      article: "Biogesic",
      discount: 12,
      id: "9b6778a0-d2a2-4c88-995a-29eccfeefb20",
      itemId: "39d1da6d-266a-4547-84cf-10db91ee53a1",
      quantity: 12,
      uPrice: 5,
      unit: UNITS.PER_PIECE
    }
  ]

  
  

  const [emptyFieldsError, setEmptyFieldsError] = useState(true)
  const [client, setClient] = useState<Client>()
  const [item, setItem] = useState(_.uniqBy(items, 'itemName').map((items : any) => {
    return {
      text : items.itemName,
      value : items.itemName,
      key : items.id
    }
  }))
  const [batch, setBatch] = useState<Array<any>>()
  const [itemInfo, setItemInfo] = useState<Items>()
  const [tableDatum, setTableDatum] = useState({
    id : '',
    itemId : '',
    quantity : 0,
    unit : UNITS.VIALS,
    article : "",
    VAT : "Yes",
    uPrice : 0,
    discount : 0,
    amount : 0
  })
  const [tableData, setTableData] = useState<Array<any>>([])
  const [unit, setUnit] = useState('VIALS')
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [Vatable, setVatable] = useState(true)
  
 const [data, setData] = useState({
    currentDate : '2013-03-10T02:00:00Z',
    totalAmount : 2300,
    term        : 90,
    discount    : 12,
    VAT         : 230.00,
    preparedBy  : "2cf9e0a2-1a64-4fe9-9726-333bd208424d",
    pmrId : "96246ffe-a9a1-49e3-9e34-65098b251604",
    items : [tableData]
  })
 

  function handleDataFromChild(data : any){
    setTableData(data)
  }
  
  function clientFind(name : any){ 
    setClient(info.find((item : Client) => {
      return item.companyName === name
    }))
  }

  function batchFind(name : any){
    setBatch(_.filter(items, (item) => {
      return item.itemName === name
    }).map((item) => {
      return{
        text : item.batchNumber,
        value : item.id,
        key : item.id
    }}))
  }

  function itemFind(id : any){
    setItemInfo(items.find((item : Items) => {
      return item.id === id
    }))
  } 

  useEffect(() => {
    setEmptyFieldsError(true)
  }, [data])
  

  useEffect(() => {
    if(tableDatum.itemId !== ''){
      const item = items.find((item : Items) => {
        return item.id === tableDatum.itemId
      })

      switch(unit){
        case UNITS.VIALS:
          (setPrice(parseFloat(item.priceVial)), setTableDatum({...tableDatum, uPrice : parseFloat(parseFloat(item.pricePiece).toFixed(2)), unit : UNITS.VIALS}));
          break;
        case UNITS.PER_PIECE:
          (setTableDatum({...tableDatum, uPrice : parseFloat(parseFloat(item.pricePiece).toFixed(2)), unit : UNITS.PER_PIECE}), setPrice(parseFloat(item.pricePiece)))
          break;
        case UNITS.BOTTLES :
          (setTableDatum({...tableDatum, uPrice : parseFloat(parseFloat(item.priceBottle).toFixed(2)), unit : UNITS.BOTTLES}), setPrice(parseFloat(item.priceBottle)))
          break;
        case UNITS.BOX :
          (setTableDatum({...tableDatum, uPrice : parseFloat(parseFloat(item.priceBox).toFixed(2)), unit : UNITS.BOX}), setPrice(parseFloat(item.priceBox)))
          break;
        default:
          return;
      }
    }
    return;
  }, [unit, quantity])

  useEffect(() => {
    if(tableDatum.itemId !== ''){
      const item = items.find((item : Items) => {
        return item.id === tableDatum.itemId
      })
      setVatable(item.VAT ? true : false)
      setTableDatum({...tableDatum, id : uuidv4(), article : item.itemName})
    }
    return;
  },[tableDatum.itemId])

  useEffect(() => {
    setTableDatum({...tableDatum, VAT : Vatable ? "Yes" : "No"})
  },[Vatable])

  useEffect(() => {
    const amount = price * quantity
    setTableDatum({...tableDatum, amount : amount})
  },[price, quantity])

  useEffect(() => {
    const amount = price * quantity
    const percent = discount / 100
    setTableDatum({...tableDatum, discount : discount, amount : amount - (amount * percent)})
  }, [discount, quantity])

 

  async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    // e.preventDefault();
    console.log(data)
    console.log("It went Through")

    // try {
    //   const res = await axios.post('http://localhost:3000/api/sales/addInvoice', data)
    //   console.log(res)
    // } catch (error) {
    //   console.log(error)
    // }
      
    }

    function handleAddItem(){
      if(tableDatum.quantity < 1 || tableDatum.article === '' || tableDatum.itemId === '' || tableDatum.uPrice === 0){
        console.log(tableDatum)
        return;
      }
     ((setTableDatum({...tableDatum, id: uuidv4()}), setTableData([...tableData, tableDatum])))
      

    }


  return (
    // session.data && 
    <>
      <Form>
        <Form.Group>
            <Form.Field required>
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
            <Form.Field required>
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
            <Form.Field required>
              <label htmlFor="terms">Terms</label>
              <Input type='number' min="0" label={{content : "Days", color : "blue"}} labelPosition='right'/>
            </Form.Field>
        </Form.Group>
        <Form.Field>
          <h3 className='tw-font-bold tw-text-2xl'>Add Item</h3>
        </Form.Field>
        <Form.Group>
        <Form.Field required>
              <label htmlFor="itemName">Item Name</label>
              <Dropdown
              id="itemName"
              search
              selection
              options={item}
              onChange={(e, item) => {batchFind(item.value)}}
              />
          </Form.Field>
          <Form.Field required>
              <label htmlFor="BatchNumner">Batch Number</label>
              <Dropdown
              id="batchNumber"
              disabled={batch ? false : true}
              search
              selection
              options={batch}
              onChange={(e, item) => {(itemFind(item.value), setTableDatum({...tableDatum, itemId : item.value !== undefined ? item.value.toString() : '' }))}}
              />
          </Form.Field>
          <Form.Field>
              <label htmlFor="manufacturingDate">Manufacturing Date</label>
              <Input id="manufacturingDate" type='date' value={itemInfo !== undefined ? itemInfo.manufacturingDate.substring(0, 10) : ''} readOnly/>
          </Form.Field>
          <Form.Field>
              <label htmlFor="ExpirationDate">Expiration Date</label>
              <Input id="ExpirationDate" type='date' value={itemInfo !== undefined ? itemInfo.ExpirationDate.substring(0, 10) : ''} readOnly/>
          </Form.Field>  
        </Form.Group>
        <Form.Group>
          <Form.Field>
              <label htmlFor="quantity">VAT?</label>
              <Input value={tableDatum.itemId != '' ? (Vatable ? "Yes" : "No") : ""} readOnly/>
          </Form.Field>
          <Form.Field>
              <label htmlFor="quantity">Quantity</label>
              <Input onChange={(e) => {(setTableDatum({...tableDatum, quantity : parseInt(e.target.value)}), setQuantity(parseInt(e.target.value)))}} min="0" type="number" label={{content : <Dropdown color='blue' defaultValue="VIALS" options={quantityOptions} onChange={(e, item) => {setUnit(item.value !== undefined ? item.value?.toString() : '')}}/>, color : "blue"}} labelPosition='right'/>
          </Form.Field>
          <Form.Field>
              <label htmlFor="discount">Discount</label>
              <Input onChange={(e) => {setDiscount(parseFloat(e.target.value) > 100 ? -1 : parseFloat(e.target.value))}} max='100.00' id="discount" min="00.00" step=".01" type='number' label={{icon: "percent", color : "blue"}} labelPosition='right'/>
          </Form.Field>
          <Button color='blue' onClick={handleAddItem}>Add Item</Button>
        </Form.Group>
        <IFlexTable color='blue' data={tableData} setData={handleDataFromChild} headerTitles={tableHeaders}/>
      </Form>
      {tableData.length > 0 ? <Button onClick={handleOnClick} color='blue'>Create Sales Invoice</Button> : <Button onClick={handleOnClick} color='blue'>Create Sales Invoice</Button>}
    </>
  )
}
