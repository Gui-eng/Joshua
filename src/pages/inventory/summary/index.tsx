import React, { SVGProps, useEffect } from 'react'
import { useSession, signOut, getSession} from 'next-auth/react'
import { Button, Grid, Label } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Inav from 'components/Inav';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import ICard from 'components/ICard';
import IFooter from 'components/IFooter';
import ISideCard from 'components/ISideCard'
import ISidePanel from 'components/ISidePanel';

const Chart = (props : SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48h-32c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48v160c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48v288c0 26.5-21.5 48-48 48h-32c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z" />
  </svg>
)

const User = (props : SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
  </svg>
)

const Item = (props : SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}> <path d="M0 80V229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7H48C21.5 32 0 53.5 0 80zm112 96c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z"/></svg>
)

const Client = (props : SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" {...props}><path d="M48 0C21.5 0 0 21.5 0 48V464c0 26.5 21.5 48 48 48h96V432c0-26.5 21.5-48 48-48s48 21.5 48 48v80h96c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48H48zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm112-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM80 96h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V112zM272 96h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16z"/></svg>
)

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
    const pmr = await axios.get("http://localhost:3000/api/getInfo/employee/pmr")
    
    return {
      props : { post : res.data.data, pmr : pmr.data.data}
    }
    
}

export default function home({ post, pmr } : any) {
  const router = useRouter()
  const { data } = useSession();


  useEffect(() => {
    if(!data){
      alert("Invalid Access")
      router.push('/')
    }
  }, [])

  useEffect(() => {
    if(post.employeeInfoId === null){
      router.push('/newUser')
    }
  },[])



  return (
    data && 
    <>
      <div className='tw-w-full tw-h-full'>
        <Inav firstName={post.employeeInfo.firstName}/>
        <div className='tw-w-full tw-flex tw-h-[80vh]'>
              <div className='tw-w-[300px] tw-items-center tw-h-full tw-flex'>
                <div className=' tw-w-full tw-h-[98%] tw-border-x-2 tw-border-slate-300'>
                  <div className='tw-w-full tw-pl-4 tw-h-full  tw-flex tw-flex-col tw-items-start tw-py-20 '>
                  <div className='tw-w-full tw-pl-4 tw-h-full  tw-flex tw-flex-col tw-items-start tw-py-20 '>
                        <ISidePanel isAdmin={post.isAdmin}/>
                      </div>
                  </div>
                </div>
              </div>
              <div className='tw-w-full tw-p-16 tw-h-full'>
                <Grid>
                  <Grid.Row columns={4}>
                    {pmr.map((item : any) => {
                        return (
                            <Grid.Column>
                                <ICard Icon={<User fill='white' width={35}/>} name={item.firstName + " " +item.lastName} link={`/inventory/summary/${item.id}`}/>
                            </Grid.Column>
                        )
                    })}
                  </Grid.Row>
                </Grid>
              </div>
        </div>
      </div>
      <IFooter/>
    </>
  )
}
