import { Dispatch, SetStateAction, useEffect, useReducer, useState } from "react"
import _ from 'lodash'
import { Button, Header, Label, SemanticCOLORS, Table, TableCell } from 'semantic-ui-react'
import axios from 'axios'
import { GetServerSideProps } from "next"
import { ItemSalesComputationData, TableProps, TotalData} from  '../types'
import { getTotal, emptyTotalData } from "functions"

const CHANGE_SORT = 'CHANGE_SORT'
const UPDATE_INITIAL_STATE = 'UPDATE_INITIAL_STATE'

interface State {
  column : string | undefined | null
  datas : Object[]
  direction : "ascending" | "descending" | undefined
}

interface Action {
  data? : Array<any> | undefined
  type : string
  column? : string | null
}


const dataRow = ( data : any, findItem: any, edit : any, allowEditing : boolean) => {
  return data.map((item : any) => (
    <Table.Row key={item.id}>
      {Object.values(item).map((item : any, index) => {
        if(index > 0){
          return (
            <TableCell key={item + index}>{item}</TableCell>
          )
        }else{
          return null
        }
        
      })}
      <TableCell key={item.id}><Button onClick={(e) => {findItem(item.id)}} color="red">Delete</Button>{allowEditing ?  <Button onClick={(e) => {edit(item.id)}} color="blue">Edit</Button> : null}</TableCell>
    </Table.Row>
  ))
}


function exampleReducer(state : State, action : Action) : State {
  switch (action.type as any) {
    case UPDATE_INITIAL_STATE:
      return {
        column: action.column,
        datas: action.data !== undefined ? [...action.data] : [],
        direction: undefined,
      }
    case CHANGE_SORT:
        if (state.column === action.column) {
          return {
            ...state,
            datas: state.datas.slice().reverse(),
            direction:
              state.direction === 'ascending' ? 'descending' : 'ascending',
          }
        }
        return {
          column: action.column,
          datas: _.sortBy(state.datas, [action.column]),
          direction: 'ascending',
        }
    default:
      throw new Error()
  }
}


const emptyTotal = {
    netAmount : 0,
    vatExempt : true,
    VATAmount : 0,
    netVATAmount : 0 ,
    VATableSales : 0,
    nonVATSales : 0,
    grossAmount : 0
}




export default function IFlextable({ data, headerTitles, color, allowEditing, handleEditing, allowDelete, updateItem, extraData, otherDiscount} : TableProps) {

  const [propsData, setPropsData] = useState(data)
  const [totalData, setTotalData] = useState<TotalData>(emptyTotal)
  

  
  useEffect(() => {
    const total = getTotal(extraData)
    setTotalData(total)
  }, [extraData])
  

  useEffect(() => {
    setPropsData(data)
  }, [data])

  const initalState : State = {
    column: null,
    datas: propsData,
    direction: undefined,
  }

  const [state, dispatch] = useReducer(exampleReducer, initalState) 
  const { column, datas, direction } = state

  function findItem(id : string){
      updateItem(propsData.find((item : any) => {
      return item.id === id
    } ))
      
  }

  function edit(id : string){
      handleEditing(propsData.find((item : any) => {
      return item.id === id
    } ))
  }
  

  return (
    <div>
      <Table sortable celled color={color}>
      <Table.Header>
        <Table.Row >
          {datas[0] !== undefined ? Object.keys(datas[0]).map((item, index) => {
            if(index > 0){
              return (
                <Table.HeaderCell key={item}
              sorted={column === item ? direction : undefined}
              onClick={() => {dispatch({ type: 'CHANGE_SORT', column: item })}}
            >
              {headerTitles[index]}
            </Table.HeaderCell>
              )
            }else{
              return null
            }
          }) : 
          headerTitles.map((item, index) => {
            return(
              index > 0 ? 
                <Table.HeaderCell key={item}>
                  {item}
                </Table.HeaderCell> : null
            )
          })
          }
          {allowDelete ? <Table.HeaderCell >
                  Actions
          </Table.HeaderCell> : null}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {dataRow(propsData, findItem, edit, allowEditing === undefined ? false : allowEditing)}
      </Table.Body>
      {
        data.length > 0 ? <Table.Footer>
        <Table.Row >
          <Table.HeaderCell colSpan={headerTitles.length - 5}/>
          <Table.HeaderCell>
                  <Header as='h4' content={"VATable Sales"}/>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h6' className="tw-text-sky-600">{totalData.vatExempt ?  totalData.VATableSales.toLocaleString() : '-'}<Label color="blue" >₱</Label></Header>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h4' content={"Total Sales (Vat Inclusive)"}/>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h6' className="tw-text-sky-600">{totalData.vatExempt ? '-' : totalData.netAmount.toLocaleString()}<Label color="blue" >₱</Label></Header>
          </Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell colSpan={headerTitles.length - 5}/>
          <Table.HeaderCell>
                  <Header as='h4' content={"VAT-Exempt Sales"}/>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h6' className="tw-text-sky-600">{totalData.vatExempt ?  totalData.nonVATSales.toLocaleString() : '-'}<Label color="blue" >₱</Label></Header>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h4' content={"Less: VAT"}/>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h6' className="tw-text-sky-600">{totalData.vatExempt ? '-' : totalData.VATAmount.toLocaleString()}<Label color="blue" >₱</Label></Header>
          </Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell colSpan={headerTitles.length - 5}/>
          <Table.HeaderCell>
                  <Header as='h4' content={"VAT Amount"}/>
          </Table.HeaderCell>
          <Table.HeaderCell>
                 <Header as='h6' className="tw-text-sky-600">{totalData.vatExempt ? totalData.netVATAmount.toLocaleString() : '-'}<Label color="blue" >₱</Label></Header>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h4' content={"Less: SC/PWD-Discount"}/>
          </Table.HeaderCell>
          <Table.HeaderCell>
                 <Header as='h6' className="tw-text-sky-600">{otherDiscount === 0 ? '-' : otherDiscount?.toFixed(2)}<Label color="blue" >%</Label></Header>
          </Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell colSpan={headerTitles.length - 3}/>
          <Table.HeaderCell>
                  <Header as='h4' content={"Amount: Net of VAT"}/>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h6' className="tw-text-sky-600">{totalData.vatExempt ? '-' : totalData.netVATAmount.toLocaleString()}<Label color="blue" >₱</Label></Header>
          </Table.HeaderCell>
        </Table.Row>
      
        <Table.Row>
          <Table.HeaderCell colSpan={headerTitles.length - 3}/>
          <Table.HeaderCell>
                  <Header as='h4' content={"VAT Amount"}/>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h6' className="tw-text-sky-600">{totalData.vatExempt ? '-' : totalData.VATAmount.toLocaleString()}<Label color="blue" >₱</Label></Header>
          </Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell colSpan={headerTitles.length - 3}/>
          <Table.HeaderCell>
                  <Header as='h4' content={"Amount Due"}/>
          </Table.HeaderCell>
          <Table.HeaderCell>
                  <Header as='h6' className="tw-text-sky-600">{totalData.netAmount.toLocaleString()}<Label color="blue" >₱</Label></Header>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer> : null
      }
    </Table>
    </div>
  )
}
