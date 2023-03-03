import { useEffect, useReducer, useState } from "react"
import _ from 'lodash'
import { SemanticCOLORS, Table, TableCell } from 'semantic-ui-react'
import axios from 'axios'
import { GetServerSideProps } from "next"



interface State {
  column : string | undefined | null
  datas : Object[]
  direction : "ascending" | "descending" | undefined
}

interface Action {
  type : 'CHANGE_SORT'
  column? : string | null
}

interface Props{
  data: Array<any>
  headerTitles : Array<string>
  color? : SemanticCOLORS
}

function exampleReducer(state : State, action : Action) : State {
  switch (action.type) {
    case 'CHANGE_SORT':
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


export default function Itable({ data, headerTitles, color} : Props) {

  const initalState : State = {
    column: null,
    datas: data,
    direction: undefined,
  }

  const [state, dispatch] = useReducer(exampleReducer, initalState) 
  const { column, datas, direction } = state



  return (
    <div>
      <Table sortable celled compact color={color}>
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
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {datas.map((item : any) => (
          <Table.Row key={item.id}>
            {Object.values(item).map((item : any, index) => {
              if(index > 0){
                return (
                  <TableCell key={item + index + (index * 2)}>{item}</TableCell>
                )
              }else{
                return null
              }

            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
      
    </div>
  )
}
