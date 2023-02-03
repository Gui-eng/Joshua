import axios from 'axios'
import IFooter from 'components/IFooter'
import ISideCard from 'components/ISideCard'
import Inav from 'components/Inav'
import Itable from 'components/Itable'
import { GetServerSideProps } from 'next'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

const tableData = [
  { id: 1, name: 'John', age: 15, gender: 'Male' },
  { id: 1, name: 'Amber', age: 40, gender: 'Female' },
  { id: 1, name: 'Leslie', age: 25, gender: 'Other' },
  { id: 1, name: 'Ben', age: 70, gender: 'Male' },
]

const headerTitles = ["id", "Name", "Age", "Gender"]

export const getServerSideProps : GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
  
  return {
    props : { post : res.data.data }
  }
  
}

export default function index({ post } : any) {

  const router = useRouter()
  const session = useSession();

  // if(!session.data){
  //   alert("Invalid Access")
  //   router.push('/')
  // }  


  return (
    <div>
        <Inav firstName={post.firstName}/>
       
        <div className='tw-w-full tw-h-[80vh] tw-flex tw-flex-col'>
              <h1 className='tw-text-[3rem] tw-font-extrabold tw-mt-20 tw-ml-20 tw-mb-10'>Sales</h1>
              <div className='tw-w-full tw-flex tw-justify-center'>
                <div className='tw-w-[90%]'>
                    <Itable data={tableData} headerTitles={headerTitles}/>
                </div>
              </div>
        </div>
    </div>
  )
}
