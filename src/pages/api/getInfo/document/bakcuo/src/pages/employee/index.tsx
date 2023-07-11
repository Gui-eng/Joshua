import axios from 'axios';
import Itable from 'components/IFlexTable';
import IFooter from 'components/IFooter'
import Inav from 'components/Inav'
import { HOSTADDRESS, PORT } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button, Header, Input } from 'semantic-ui-react';

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
    
    const info = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/employee`)
    return {
      props : { post : res.data.data, info : info.data.data }
    }
    
}

const headerTitles = ["id", "Name", "Department", "Code", "Date Hired", "Actions"]

export default function index({ post, info }  : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()
  const [refData, setRefData] = useState(info.map((item : any) => {
    return {
        id : item.id,
        name : item.firstName + " " + item.lastName,
        department : item.department,
        code : item.code === "" ? '-' : item.code,
        dateHired : item.dateHired.substring(10, 0),
        action : <Button color='blue' onClick={() => {router.push(`/employee/editEmployee/${item.id}`)}}>Edit</Button>
    }
}))
  
  const [data, setData] = useState(refData)


function filterData(str : string, array : Array<any>){
  const arr = array.filter((item) => {
    return item.name.includes(str) || item.code.includes(str)
  })
  setData(arr)
}



  return (
    <>
    <div className='tw-w-full tw-h-full'>
    <Inav/>
      <div className='tw-w-full tw-flex tw-flex-col tw-pb-60'>
           <div className='tw-w-full tw-flex tw-justify-center tw-my-8'>
                <div className='tw-w-[90%]'>
                    <h1 className='tw-text-2xl tw-font-bold'>User List</h1>
                </div>
            </div>
            <div className='tw-w-full tw-flex tw-justify-center tw-my-8'>
                <div className='tw-w-[90%]'>
                    <Button color='blue' onClick={() => {router.push("/add/employee")}}>+ Add Employee Info</Button>
                    <Input onChange={(e) => {filterData(e.target.value, refData)}} type='text' placeholder='Search...' icon={'search'}/>
                </div>
            </div>
            <div className='tw-w-full tw-flex tw-justify-center '>
                <div className='tw-w-[90%]'>
                    <Itable allowDelete={false} headerTitles={headerTitles} data={data} />
                </div>
            </div>
           
      </div>
    </div>
    <IFooter/>
  </>
  )
}
