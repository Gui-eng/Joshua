import axios from 'axios'
import _, { floor, uniqueId } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import IFlexTable from '../../../../components/InvoiceTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Dropdown, Form, FormField, Header, Input, Label, Message } from 'semantic-ui-react'



const tableHeaders = ["id","QTY", "UNIT", "ARTICLES","BATCH NO.", "VATABLE", "U-PRICE", "DISCOUNT", "AMOUNT"]

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

const quantityOptions = [
  { key:'vial' , value : UNITS.VIALS, text : 'Vial/s'},
  { key:'box' , value : UNITS.BOX, text : 'Box/s'},
  { key:'bottle' , value : UNITS.BOTTLES, text : 'Bottle/s'},
  { key:'piece' , value : UNITS.PER_PIECE, text : 'Piece/s'}

]
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

export const getServerSideProps : GetServerSideProps = async (context) => {
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

    const session = await getSession(context);
    const usr = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
    
    return {
      props : { info : res.data.data, options : opt , pmrCodes : pmrCodes, items : item.data.data, pmr : pmr.data.data, user : usr.data.data}
    }
}

export default function item({ info, options, user, pmrCodes, items} : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const session = useSession();

  // useEffect(() => {
  //   if(!session.data){
  //     alert("Invalid Access")
  //     router.push('/')
  //   }
  // }, [])


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
    batchNumber : "",
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
  const [disabled, setDisabled] = useState(true)
  const [remarks, setRemarks] = useState("")
  const [dateIssued, setDateIssued] = useState("")
  const [pmrId, setPmrId] = useState("")
  const [total, setTotal] = useState(0)
  const [stockIn, setStockIn] = useState(false)
  const [disabledStockIn, setDisabledStockIn] = useState(false)
  const [terms, setTerms] = useState(0)
  
 const [data, setData] = useState({
    clientId : "",
    currentDate : '',
    totalAmount : 0,
    term        : 0,
    discount    : 0,
    VAT         : 0,
    preparedBy  : user.employeeInfo.id,
    pmrId : "",
    items : [tableData],
    remarks : "",
    stockIn : false,
  })
 

  function handleDataFromChild(data : any){
    setTableData(data)
  }

  function handleSetTotal(amount : number){
    setTotal(amount)
  }
  
  function clientFind(name : any){ 
    setClient(info.find((item : Client) => {
      return item.companyName === name
    }))
    setData({...data, clientId : info.find((item : Client) => {
      return item.companyName === name
    }).id})
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
    setDisabled(true)
  }

  function itemFind(id : any){
    setItemInfo(items.find((item : Items) => {
      return item.id === id
    }))
  } 

  useEffect(() => {
    setData({...data, remarks : remarks})
  },[remarks])

  useEffect(() => {
    setData({...data, currentDate : dateIssued})
  },[dateIssued])

  useEffect(() => {
    setData({...data, pmrId : pmrId})
  },[pmrId])

  useEffect(() => {
    setData({...data, stockIn : stockIn})
  },[stockIn])
  
  useEffect(() => {
    setData({...data, term : terms})
  },[terms])

  useEffect(() => {
    setData({...data, totalAmount : total})
  }, [total]) 

  useEffect(() => {
    setData({...data, items : tableData})
  }, [tableData]) 

  useEffect(() => {
    setEmptyFieldsError(true)
    if(data.items.length !== 0 && !stockIn){
      setDisabledStockIn(true)
    }else{
      setDisabledStockIn(false)
    }
  }, [data])
  
 
  

  useEffect(() => {
    if(tableDatum.itemId !== ''){
      const item = items.find((item : Items) => {
        return item.id === tableDatum.itemId
      })


      switch(unit){
        case UNITS.VIALS:
          (setPrice(parseFloat(item.priceVial)), setTableDatum({...tableDatum, uPrice : parseFloat(parseFloat(item.priceVial).toFixed(2)), unit : UNITS.VIALS}));
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
  }, [unit, quantity, tableDatum.itemId])

 

  useEffect(() => {
    if(tableDatum.itemId !== ''){
      const item = items.find((item : Items) => {
        return item.id === tableDatum.itemId
      })
      setVatable(item.VAT ? true : false)
      setDisabled(false)
      setTableDatum({...tableDatum, VAT : item.VAT ? "Yes" : "No", uPrice : item.priceVial, id : uuidv4(), article : item.itemName, batchNumber : item.batchNumber})
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
    e.preventDefault();
    if(data.items.length === 0 || data.clientId === '' || data.pmrId === '' || data.term === 0 || data.currentDate === '' ){
      alert("There are black requried fields!!")
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/sales/addInvoice', data)

    } catch (error) {
      console.log(error)
    }

    router.push('/sales/info/salesInvoice')
      
    }

    

    async function handleAddItem(){
      if(data.pmrId === '' || tableDatum.quantity < 1 || tableDatum.article === '' || tableDatum.itemId === '' || tableDatum.uPrice === 0){
        alert("There are empt requred fields")
        return;
      }

      const collection = await axios.get(`http://localhost:3000/api/getInfo/item/stocks/${data.pmrId}`)
      const selected = collection.data.data.find((item : any) => {
        return item.itemInfoId === tableDatum.itemId
      });
      
      if(!stockIn){
        switch(unit){
          case UNITS.VIALS : 
            if (selected.stocksVial === 0 || selected.stocksVial < tableDatum.quantity ){
              alert("Item is out of stock!")
              return;
            }
            break;
          case UNITS.BOX : 
            if (selected.stocksBox === 0 || selected.stocksVial < tableDatum.quantity){
              alert("Item is out of stock!")
              return;
            }
            break;
          case UNITS.BOTTLES : 
            if (selected.stocksBottle === 0 || selected.stocksVial < tableDatum.quantity){
              alert("Item is out of stock!")
              return;
            }
            break;
          case UNITS.PER_PIECE : 
            if (selected.stocksPiece === 0 || selected.stocksVial < tableDatum.quantity){
              alert("Item is out of stock!")
              return;
            }
            break;
          default:
              break;
        }
      }

     (setTableDatum({...tableDatum, id: uuidv4()}), setTableData([...tableData, tableDatum]))
      
    }

    function getDate() : string{
        const date = new Date(Date.now())
        const localDate = new Date(date.getTime() +  24 * 60 * 1000).toISOString()

        return localDate.substring(0, 10)
    }
  return (
    session.data && 
    <div className='tw-h-screen tw-w-full'>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%]  tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[90%] tw-rounded-tl-lg tw-rounded-tr-lg'>
             <Form>
              <Form.Field>
                <h1 className='tw-font-bold tw-text-2xl'>Sales Invoice</h1>
              </Form.Field>
              <Form.Group>
                  <Form.Field required >
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
                      <Input id="remarks" placeholder="Remarks" onChange={(e) => {setRemarks(e.target.value)}} />
                  </Form.Field>
              </Form.Group>
              <Form.Group>
                  <Form.Field>
                      <label htmlFor="dateIssued">Date Issued</label>
                      <Input type='date' max={getDate()} id="dateIssued" onChange={(e) =>  {setDateIssued(e.target.value + "T00:00:00Z")}}/>
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
                        onChange={(e, item) => {setPmrId(item.value ? item.value.toString() : "")}}
                      />
                  </Form.Field>
                  <Form.Field required>
                    <label htmlFor="terms">Terms</label>
                    <Input onChange={(e) => {setTerms(parseInt(e.target.value))}} type='number' min="0" label={{content : "Days", color : "blue"}} labelPosition='right'/>
                  </Form.Field>
              </Form.Group>
              <Form.Field>
                <h3 className='tw-font-bold tw-text-xl'>Add Item</h3>
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
                <Form.Field disabled={disabled}>
                    <label htmlFor="manufacturingDate">Manufacturing Date</label>
                    <Input id="manufacturingDate" type='date' value={itemInfo !== undefined ? (disabled ? " " : itemInfo.manufacturingDate.substring(0, 10)) : ''} readOnly/>
                </Form.Field>
                <Form.Field disabled={disabled}>
                    <label htmlFor="ExpirationDate">Expiration Date</label>
                    <Input id="ExpirationDate" type='date' value={itemInfo !== undefined ? (disabled ? " " : itemInfo.manufacturingDate.substring(0, 10)) : ''} readOnly/>
                </Form.Field>  
              </Form.Group>
              <Form.Group>
                <Form.Field disabled={disabled}>
                    <label htmlFor="quantity">VAT?</label>
                    <Input value={tableDatum.itemId != '' ? (disabled ? "" : (Vatable ? "Yes" : "No")) : ""} onChange={(e) => {setVatable(e.target.value === "No" ? false : true)}} readOnly/>
                </Form.Field>
                <Form.Field disabled={disabled}>
                    <label htmlFor="quantity">Quantity</label>
                    <Input value={disabled ? "" : null} onChange={(e) => {(setTableDatum({...tableDatum, quantity : parseInt(e.target.value)}), setQuantity(parseInt(e.target.value)))}} min="0" type="number" label={{content : <Dropdown color='blue' defaultValue="VIALS" options={quantityOptions} onChange={(e, item) => {setUnit(item.value !== undefined ? item.value?.toString() : '')}}/>, color : "blue"}} labelPosition='right'/>
                </Form.Field>
                <Form.Field disabled={disabled}>
                    <label htmlFor="discount">Discount</label>
                    <Input value={disabled ? "" : null} onChange={(e) => {setDiscount(parseFloat(e.target.value) > 100 ? -1 : parseFloat(e.target.value))}} max='100.00' id="discount" min="00.00" step=".01" type='number' label={{icon: "percent", color : "blue"}} labelPosition='right'/>
                </Form.Field>
                <Button color='blue' onClick={handleAddItem}>Add Item</Button>
              </Form.Group>
              <Checkbox 
              disabled={disabledStockIn}
              label = {<label>{!stockIn ? <Header color='grey'>Stock In</Header> : <Header>Stock In</Header>}</label>}
              onChange={() => {setStockIn(!stockIn ? true : false)}}
              toggle/>
            </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-justify-center'>
          <div className='tw-w-[90%]'>
            <IFlexTable color='blue' data={tableData} setData={handleDataFromChild} setTotal={handleSetTotal} headerTitles={tableHeaders}/>
          </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
          <div className='tw-w-[90%]'>
            {tableData.length > 0 ? <Button onClick={handleOnClick} color='blue'>Create Sales Invoice</Button> : null}  
          </div>
        </div>
    </div>
  )
}
