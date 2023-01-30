import IFooter from 'components/IFooter'
import Inav from 'components/Inav'
import Itable from 'components/Itable'
import React from 'react'

const tableData = [
  { id: 1, name: 'John', age: 15, gender: 'Male' },
  { id: 1, name: 'Amber', age: 40, gender: 'Female' },
  { id: 1, name: 'Leslie', age: 25, gender: 'Other' },
  { id: 1, name: 'Ben', age: 70, gender: 'Male' },
]

const headerTitles = ["id", "Name", "Age", "Gender"]

export default function index() {
  return (
    <div>
        <Inav/>
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
