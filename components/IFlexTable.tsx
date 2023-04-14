import { useEffect, useReducer, useState } from "react"
import _ from 'lodash'
import { Button, Header, Label, SemanticCOLORS, Table, TableCell } from 'semantic-ui-react'
import axios from 'axios'
import { GetServerSideProps } from "next"
import { TableProps} from  '../types'
import { formatCurrency } from "functions"

const CHANGE_SORT = 'CHANGE_SORT'
const UPDATE_INITIAL_STATE = 'UPDATE_INITIAL_STATE'
interface State {
  column : string | undefined | null
  datas : Object[]
  direction : "ascending" | "descending" | undefined
}

const cellStyle :string = 'tw-border-none tw-bg-gray-100 tw-py-2 '

interface Action {
  type : string
  column? : string | null
  data? : any
}


function exampleReducer(state: State, action: Action): State {
  const { type, column, data } = action;

  switch (type) {
    case UPDATE_INITIAL_STATE:
      return {
        column,
        datas: data !== undefined ? [...data] : [],
        direction: undefined,
      };
    case CHANGE_SORT:
      if (state.column === column) {
        const sortedDatas = [...state.datas];
        if (state.direction === 'ascending') {
          sortedDatas.reverse();
        }
        return {
          ...state,
          datas: sortedDatas,
          direction: state.direction === 'ascending' ? 'descending' : 'ascending',
        };
      }
      return {
        column,
        datas: _.sortBy(state.datas, [action.column]),
        direction: 'ascending',
      };
    default:
      return state;
  }
}


export default function Itable({ data, headerTitles, color,allowDelete, allowEditing, updateItem, hasFooter, extraData} : TableProps) {

  const [deleting, setDeleting] = useState(false)
  const [propsData, setPropsData ] = useState(data)


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
  
  useEffect(() => {
    setPropsData(data)
  }, [data])

  useEffect(() => {
    dispatch({ type : UPDATE_INITIAL_STATE, data : propsData})
  }, [propsData])


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
          {allowDelete || allowEditing ? <Table.HeaderCell >
                  Actions
          </Table.HeaderCell> : null}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {datas.map((item : any) => (
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
            {allowDelete ? <TableCell><Button color="red" onClick={() => {findItem(item.id)}}>Delete</Button></TableCell> : null}
            {allowEditing ? <TableCell><Button color="blue" onClick={() => {findItem(item.id)}}>Edit</Button></TableCell> : null}
          </Table.Row>
        ))}
      </Table.Body>
      {
        (hasFooter && propsData.length > 0 ) && 
       <Table.Footer>
         <Table.Row >
            <Table.HeaderCell colSpan={6}/>
            <Table.HeaderCell>
                <Header as={'h4'} >Amount Due: </Header>
            </Table.HeaderCell>
            <Table.HeaderCell>
                <Header as={'h4'} >{formatCurrency(extraData)}<Label color="blue" >₱</Label></Header>
            </Table.HeaderCell>
          </Table.Row>
       </Table.Footer>
       }
    </Table>
      
    </div>
  )
}
