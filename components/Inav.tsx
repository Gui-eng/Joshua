import { signOut } from 'next-auth/react'
import React from 'react'
import { Button } from 'semantic-ui-react'
import { useSession } from 'next-auth/react'

export default function Inav({ firstName } : any) {
    const { data } = useSession()
    
  return (
    data && 
    <div className='navbar'>
      <h1>Welcome,  {firstName}</h1>
      <button className='button' onClick={() => {signOut({ callbackUrl: 'http://localhost:3000/' })}}>Sign out</button>
    </div>
  )
}
