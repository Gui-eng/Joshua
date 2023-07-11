import { useRouter } from 'next/router';
import React from 'react'


type Props = {
    name: string;
    Icon?: JSX.Element;
    link: string
  };

export default function ISideCard({ Icon, name, link} : Props) {

    const router = useRouter()

    function handleOnClick(){
        router.push(`/${link}`)
      }

  return (
    <div className='tw-flex tw-items-center'>
        <div className='tw-mt-4 tw-h-full'>
            {Icon}
        </div>
        <div className='tw-ml-4'>
            <h3 onClick={handleOnClick} className='tw-text-xl tw-font-black tw-text-sky-500 hover:tw-text-sky-600 hover:tw-cursor-pointer active:tw-text-black'>{name}</h3>
        </div>
    </div>
  )
}
