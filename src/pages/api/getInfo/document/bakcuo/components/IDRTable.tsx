import { useEffect, useReducer, useState } from "react"
import _ from 'lodash'
import { Button, Header, Icon, Input, Label, SemanticCOLORS, Table, TableCell, TableFooter } from 'semantic-ui-react'
import axios from 'axios'
import { GetServerSideProps } from "next"

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

interface Props{
  data: Array<any>
  headerTitles : Array<string>
  color? : SemanticCOLORS
  setData : any
  setTotal : any
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


export default function Itable({ data, headerTitles, color, setData, setTotal} : Props) {

  const [propsData, setPropsData] = useState(data)

  const initalState : State = {
    column: null,
    datas: propsData,
    direction: undefined,
  }

  const [state, dispatch] = useReducer(exampleReducer, initalState) 

  const [amount, setAmount] = useState({
    withVATExempt : false,
    totalAmount : 0,
    VAT : 0,
    netVAT : 0,
  })

  const [nonVATAmount, setNonVATAmount] = useState({
    withVATExempt : true,
    vatableSales : 0,
    vatExemptSales: 0,
    vatAmount : 0,
  })

  useEffect(() => {

    if(propsData.length > 0){
      if(propsData.find((item : any) => {return item.VAT === "No"}) !== undefined){
        const nonVat = _.filter(propsData, (item : any) => {return item.VAT === "No"});
        const withVat = _.filter(propsData, (item : any) => {return item.VAT === "Yes"});
        const sumNonVat = _.sumBy(nonVat, (o) => { return o.amount});
        const sumWithVat = _.sumBy(withVat, (o) => {return o.amount});
        ( setAmount({...amount, totalAmount : 0, netVAT : 0, VAT: 0}), setNonVATAmount({...nonVATAmount,
        vatExemptSales : sumNonVat, vatableSales : _.sumBy(withVat, (o) => {return o.amount}), vatAmount : parseFloat(((sumWithVat * 1.12) - sumWithVat).toFixed(2))
        }))
      }else{
        const sum = _.sumBy(propsData, (o) => {return o.amount});
        const vat = (sum * 1.12) - sum;
        (setNonVATAmount({...nonVATAmount, vatableSales : 0, vatAmount : 0, vatExemptSales : 0}),setAmount({...amount, totalAmount : sum, VAT : vat, netVAT : sum - vat}))
      }
    }
    
    return;
  }, [propsData])


  useEffect(() => {
    setPropsData(data)
  }, [data])

  useEffect(() => {
    dispatch({ type : UPDATE_INITIAL_STATE, data : propsData})
  }, [propsData])


  useEffect(() => {
    setTotal(parseFloat(amount.totalAmount.toFixed(2)))
  },[amount.totalAmount])

  useEffect(() => {
    setTotal(nonVATAmount.vatableSales + nonVATAmount.vatExemptSales)
  }, [nonVATAmount.vatExemptSales, nonVATAmount.vatableSales])

  const { column, datas, direction } = state

  function handleDelete(id : any){
    _.remove(propsData, item => item.id === id)
    setPropsData([...propsData])
    setData([...propsData])
  }

  const generateRow = datas.map((item : any) => (
    <Table.Row key={item.id}>
      {Object.values(item).map((item : any, index) => {
        if(index > 1){
          return (
            <TableCell key={item + index + (index * 2)}>{item}</TableCell>
          )
        }else{
          return null
        }
      })}
      <TableCell ><Button onClick={() => {handleDelete(item.id)}} color={'red'}>Delete</Button></TableCell>
    </Table.Row>
  ))


  return (
    <div>
      <Table sortable celled compact color={color}>
      <Table.Header>
        <Table.Row>
          {datas[0] !== undefined ? Object.keys(datas[0]).map((item, index) => {
            if(index > 1 ){
              return (
                <Table.HeaderCell key={item}
                width={1}
              sorted={column === item ? direction : undefined}
              onClick={() => {dispatch({ type: 'CHANGE_SORT', column: item })}}
            >
              {headerTitles[index - 1]}
            </Table.HeaderCell>
              )
            }else{
              return null
            }
          }) : 
          headerTitles.map((item, index) => {
            return(
              index > 0 ? 
                <Table.HeaderCell key={index * 2}>
                  {item}
                </Table.HeaderCell> : null
            )
          })
          }
          <Table.HeaderCell width={1}>
                Actions  
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
          {generateRow}
      </Table.Body>
      {datas.length > 0 ?  <Table.Footer>
          <Table.Row>
              <Table.HeaderCell colSpan='6'/>
              <Table.HeaderCell>
                  <Header as='h4' content={"Total Amount"}/>
              </Table.HeaderCell>
              <Table.HeaderCell>
                <Header as='h4'>{amount.totalAmount !== 0 ? amount.totalAmount.toFixed(2) : (nonVATAmount.vatExemptSales !== 0 ? nonVATAmount.vatableSales + nonVATAmount.vatExemptSales : '-' )}<Label color="blue" >₱</Label></Header>
              </Table.HeaderCell>
          </Table.Row>
          
          
      </Table.Footer> : null}
    </Table>
      
    </div>
  )
}
