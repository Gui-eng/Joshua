import React, { SVGProps, useEffect } from 'react'
import { useSession, signOut, getSession} from 'next-auth/react'
import { Button, Grid, Label } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Inav from 'components/Inav';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import ICard from 'components/ICard';
import IFooter from 'components/IFooter';

const Chart = (props : SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48h-32c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48v160c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48v288c0 26.5-21.5 48-48 48h-32c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z" />
  </svg>
)

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
    
    return {
      props : { post : res.data.data }
    }
    
}

export default function home({ post } : any) {
  const router = useRouter()
  const { data } = useSession();

  // useEffect(() => {
  //   if(!data){
  //     alert("Invalid Access")
  //     router.push('/')
  //   }
  // }, [])


  return (
    data && 
    <>
      <div className='tw-w-full tw-h-full'>
        <Inav firstName={post.firstName}/>
        <div className='tw-w-full tw-flex tw-h-[80vh]'>
              <div className='tw-w-[300px] tw-items-center tw-h-full tw-flex'>
                <div className=' tw-w-full tw-h-[98%] tw-border-x-2 tw-border-slate-300'>\

                </div>
              </div>
              <div className='tw-w-full tw-p-16 tw-h-full'>
                <Grid>
                  <Grid.Row columns={4}>
                    <Grid.Column>
                      <ICard Icon={<Chart fill='white' width={35}/>} name='Sales' link='sales'/>
                    </Grid.Column>
                    
                  </Grid.Row>
                </Grid>
              </div>
        </div>
      </div>
      <IFooter/>
    </>
  )
}
