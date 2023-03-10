import { useRouter } from 'next/router';
import React from 'react'

type Props = {
    name: string;
    Icon?: JSX.Element;
    link: string
  };

export default function ICard({ Icon, name, link} : Props) {

  const router = useRouter()

  function handleOnClick(){
    router.push(`/${link}`)
  }

  return (
    <div onClick={handleOnClick} className='tw-w-[200px] tw-px-4 tw-pb-4 tw-relative tw-bg-sky-500 hover:tw-translate-x-[-2px] hover:tw-translate-y-[-4px] tw-transition-all tw-shadow-md tw-rounded-md active:tw-transition-none active:tw-translate-y-[4px] active:tw-translate-x-[2px]  active:tw-bg-sky-800'> 
                <div className=' tw-py-2'>
                  {Icon}
                </div>
                <div className=' tw-break-words tw-bottom-4 tw-left-4'>
                  <h3 className='tw-font-bold tw-text-white tw-text-2xl'>{name}</h3>
                </div>
    </div>
  )
}
