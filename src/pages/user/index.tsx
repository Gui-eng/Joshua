import axios from 'axios';
import Itable from 'components/IFlexTable';
import IFooter from 'components/IFooter'
import Inav from 'components/Inav'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button, Header } from 'semantic-ui-react';

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
    
    const info = await axios.get(`http://localhost:3000/api/getInfo/users`)
    return {
      props : { post : res.data.data, info : info.data }
    }
    
}

const headerTitles = ["id", "Email", "Username", "Name", "Department", "Status"]

export default function index({ post, info }  : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()

  const [data, setData] = useState(info.map((item : any) => {
    return {
        id : item.id,
        email : item.email,
        username : item.username,
        name : item.employeeInfo ? item.employeeInfo.firstName : " Info not yet set",
        department : item.employeeInfo.department,
        status : item.isActive ? <Header color='green' content="Active" icon={"check circle outline"}/>:  <Header color='red' content="Inactive" icon={"x"}/>
    }
}))


  useEffect(()=> {

  },[])


  return (
    <>
    <div className='tw-w-full tw-h-full'>
      <Inav firstName={post.username}/>
      <div className='tw-w-full tw-flex tw-flex-col tw-h-[80vh]'>
           <div className='tw-w-full tw-flex tw-justify-center tw-my-8'>
                <div className='tw-w-[90%]'>
                    <h1 className='tw-text-2xl tw-font-bold'>User List</h1>
                </div>
            </div>
            <div className='tw-w-full tw-flex tw-justify-center '>
                <div className='tw-w-[90%]'>
                    <Itable allowDelete={false} headerTitles={headerTitles} data={data} editing={false} />
                </div>
            </div>
            <div className='tw-w-full tw-flex tw-justify-center tw-my-8'>
                <div className='tw-w-[90%]'>
                    <Button color='blue' onClick={() => {router.push("/auth/register")}}>+ Add A User</Button>
                </div>
            </div>
      </div>
    </div>
    <IFooter/>
  </>
  )
}
