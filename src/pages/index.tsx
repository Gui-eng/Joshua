import { useEffect, useReducer, useState } from "react"
import _ from 'lodash'
import { Table, TableCell } from 'semantic-ui-react'
import axios from 'axios'
import { GetServerSideProps } from "next"
import Itable from "components/Itable"
import { signIn } from "next-auth/react"

interface Data {
  id : string
  firstName : string
  middleInitial : string
  lastName : string
  role : string
  idNumber : string
}

interface Employees {
  data : Array<Data>
}

export const getServerSideProps : GetServerSideProps = async (context) => {
  try {
    const res = await axios.get('http://localhost:3000/api/hello')
    return {props: { data : res.data.data}}
  } catch (error) {
    return { props : { error : 'Something Went Wrong'}}
  }
}



export default function Home({ data } : Employees) {
  signIn()
  return (
    null
    
  )
}
