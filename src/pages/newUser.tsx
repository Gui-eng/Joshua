import { useRouter } from 'next/router'
import React from 'react'
import { Button } from 'semantic-ui-react'

export default function newUser() {
    const router = useRouter();

  return (
    <div className='tw-w-screen tw-h-screen tw-flex tw-flex-col tq tw-items-center tw-justify-center'>
        <h1 className='tw-font-bold tw-text-lg'>New User?</h1>
        <Button color='blue' onClick={() => {router.push('/add/employee')}}>Add Info</Button>
    </div>
  )
}
