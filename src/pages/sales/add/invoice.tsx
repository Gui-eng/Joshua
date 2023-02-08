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
  

  const [emptyFieldsError, setEmptyFieldsError] = useState(true)
  const [data, setData] = useState({
    companyName :'',
    address     :'',
    TIN         :'',
  })
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
    unit : "",
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
  const [Vatable, setVatable] = useState(true)
  
 
 

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
        case 'VIALS':
          (setTableDatum({...tableDatum, uPrice : parseFloat(item.priceVial), unit : 'VIAL/S'}), setPrice(parseFloat(item.priceVial)))
          break;
        case 'PER PIECE':
          (setTableDatum({...tableDatum, uPrice : parseFloat(item.pricePiece), unit : 'PIECE/S'}), setPrice(parseFloat(item.pricePiece)))
          break;
        case 'BOTTLES' :
          (setTableDatum({...tableDatum, uPrice : parseFloat(item.priceBottle), unit : 'BOTTLE/S'}), setPrice(parseFloat(item.priceBottle)))
          break;
        default:
          return;
      }
    }
    return;
  }, [unit])

  useEffect(() => {
    if(tableDatum.itemId !== ''){
      const item = items.find((item : Items) => {
        return item.id === tableDatum.itemId
      })
      setVatable(item.VAT ? true : false)
      setTableDatum({...tableDatum, article : item.itemName})
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

 

  async function handleOnClick(e : React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();
    if(data.companyName === '' || data.address === '' || data.TIN === ''){
      setEmptyFieldsError(false)
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/getInfo/client', data)
      console.log(res)
    } catch (error) {
      console.log(error)
    }
      
    }

    function handleAddItem(){
      if(tableDatum.quantity < 1 || tableDatum.article === '' || tableDatum.itemId === '' || tableDatum.uPrice === 0){
        return;
      }
     ((setTableDatum({...tableDatum, id: uuidv4()}), setTableData([...tableData, tableDatum])))
      

    }


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
          <Form.Field>
              <label htmlFor="discount">Discount</label>
              <Input onChange={(e) => {setTableDatum({...tableDatum, discount : parseFloat(e.target.value) > 100 ? -1 : parseFloat(e.target.value) })}} max='100.00' id="discount" min="00.00" step=".01" type='number' label={{icon: "percent", color : "blue"}} labelPosition='right'/>
          </Form.Field>
          <Form.Field>
              <label htmlFor="manufacturingDate">Manufacturing Date</label>
              <Input id="manufacturingDate" type='date' value={itemInfo !== undefined ? itemInfo.manufacturingDate.substring(0, 10) : ''} readOnly/>
          </Form.Field>
          <Form.Field>
              <label htmlFor="ExpirationDate">Expiration Date</label>
              <Input id="ExpirationDate" type='date' value={itemInfo !== undefined ? itemInfo.ExpirationDate.substring(0, 10) : ''} readOnly/>
          </Form.Field>
          <Form.Field>
              <label htmlFor="itemName">Item Name</label>
              <Dropdown
              id="itemName"
              search
              selection
              options={item}
              onChange={(e, item) => {batchFind(item.value)}}
              />
          </Form.Field>
          <Form.Field>
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
              <label htmlFor="quantity">VAT?</label>
              <Input value={tableDatum.itemId != '' ? (Vatable ? "Yes" : "No") : ""} readOnly/>
          </Form.Field>
          <Form.Field>
              <label htmlFor="quantity">Quantity</label>
              <Input onChange={(e) => {(setTableDatum({...tableDatum, quantity : parseInt(e.target.value)}), setQuantity(parseInt(e.target.value)))}} min="0" type="number" label={{content : <Dropdown color='blue' defaultValue="VIALS" options={quantityOptions} onChange={(e, item) => {setUnit(item.value !== undefined ? item.value?.toString() : '')}}/>, color : "blue"}} labelPosition='right'/>
          </Form.Field>
          <Button color='blue' onClick={handleAddItem}>Add Item</Button>
        </Form.Group>
        <IFlexTable color='blue' data={tableData} setData={handleDataFromChild} headerTitles={tableHeaders}/>
      </Form>
    </>
  )
}
