
import axios from 'axios';
import Itable from 'components/IFlexTable';
import IFooter from 'components/IFooter'
import Inav from 'components/Inav'
import { HOSTADDRESS, PORT } from 'functions';
import _ from 'lodash';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button, Header } from 'semantic-ui-react';

enum UNITS {
  BOX = 'BOXES',
  VIALS = 'VIALS',
  BOTTLES = 'BOTTLES',
  PER_PIECE = 'PER_PIECE',
}

export const getServerSideProps : GetServerSideProps = async (context) => {


    const info = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item/info/${context.params !== undefined ? context.params.id : ""}`)
    const stocks = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/item/stocks/all/${info.data.data.id}`)
    const otherDocs = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/inventory/${info.data.data.id}`)

    return {
      props : { info : info.data.data, items :  info.data.items, stocks : stocks.data.data, otherDocs : otherDocs.data.data}
    }
    
}

const headerTitles = ["id", "Date", "Clients Name", "Quantity Issued", "Related Document", "Remarks"]

export default function index({ info, items, stocks, otherDocs}  : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const documents = [...otherDocs, ...items]
  const list = documents.map((item : any) => {
    const doc = item.DR ? item.DR : item.SI ? item.SI : item
    return {
      id : item.id,
      date : doc.dateIssued.substring(10, 0),
      clientName: doc.client.clientInfo.companyName,
      stockOut : item.quantity,
      relatedDocument : item.DR ? <a href={`http://${HOSTADDRESS}:${PORT}/sales/info/${doc.id}`}>{item.DR ? "DR: " + item.DR.deliveryReciptNumber : item.SI ? "SI : " + item.SI.salesInvoiceNumber : "-" }</a> : item.SI ? <a href={`http://${HOSTADDRESS}:${PORT}/sales/info/${doc.id}`}>{item.DR ? "DR: " + item.DR.deliveryReciptNumber : item.SI ? "SI : " + item.SI.salesInvoiceNumber : "-" }</a> : <a href={`http://${HOSTADDRESS}:${PORT}/inventory/${doc.type === 'POD' ? 'proofOfDelivery' : 'stockRequest' }/view/${doc.number}`}>{doc.type === 'POD' ? "POD: " + doc.number : "SR : " + doc.number }</a>,
      remarks : doc.remarks
    }
  })


  return (
    <>
    <div className='tw-w-full tw-h-full'>
      <div className='tw-w-full tw-flex tw-flex-col tw-pb-60'>
           <div className='tw-w-full  tw-flex tw-justify-center tw-mt-24 '>
                <div className='tw-w-[90%] tw-flex tw-flex-col tw-bg-sky-600 tw-p-2 tw-rounded-tr-lgtw-rounded-tr-lg tw-rounded-tl-lg tw-gap-4'>
                    <h1 className='tw-text-2xl tw-text-white tw-font-bold'>{info.itemName}</h1>
                    <div>
                      <h1 className='tw-font-bold tw-text-white tw-text-xl'>Manufacturing Date : {info.manufacturingDate.substring(10, 0)}</h1>
                      <h1 className='tw-font-bold tw-text-white tw-text-xl'>Expiration Date : {info.expirationDate.substring(10, 0)}</h1>
                    </div>
                    <h1 className='tw-text-xl tw-text-white tw-font-bold'>Batch No. : {info.batchNumber}</h1>
                </div>
                
            </div>
            <div className='tw-w-full tw-flex tw-justify-center '>
                <div className='tw-w-[90%]'>
                    <Itable allowDelete={false} headerTitles={headerTitles} data={list} />
                </div>
            </div>
      </div>
    </div>
    <IFooter/>
  </>
  )
}
