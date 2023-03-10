import axios from 'axios'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { Button, Header } from 'semantic-ui-react'

export const getServerSideProps : GetServerSideProps = async (context) => {
    try {
      const res = await axios.get('http://localhost:3000/api/getInfo/users/one')
      return {props: { data : res.data}}
    } catch (error) {
      return { props : { error : 'Something Went Wrong'}}
    }
  }

export default function setup({ data } : InferGetServerSidePropsType<typeof getServerSideProps>) {

   const router = useRouter()


   useEffect(() => {
    if(data.length > 0){
      router.push('/setup')
    }
  },[])
    



  return (
    <div className='tw-w-full tw-h-screen tw-flex tw-items-center tw-justify-center'>
        <div className='tw-flex tw-flex-col tw-items-center'>
            <Header>Setup an admin account</Header>
            <Button color='blue' onClick={() => {router.push('/auth/register')}}>Sign Up</Button>
        </div>
    </div>
  )
}
