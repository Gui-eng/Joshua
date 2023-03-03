import { signOut } from 'next-auth/react'
import React, { SVGProps } from 'react'
import { Button } from 'semantic-ui-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'


interface Props {
  firstName : string
}

const User = (props : SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
  </svg>
)

export default function Inav({ firstName } : Props) {
    const { data } = useSession()
    const router = useRouter()
    
  return (
    data && 
    <div className='navbar'>
      <h1 onClick={() => {router.push('/home')}} className='hover:tw-cursor-pointer hover:tw-text-sky-800 tw-transition-all active:tw-text-sky-300 tw-flex tw-items-center tw-gap-4'><User fill='white' width={30}/>  {firstName}</h1>
      <button className='button' onClick={() => {signOut({ callbackUrl: 'http://localhost:3000/' })}}>Sign out</button>
    </div>
  )
}
