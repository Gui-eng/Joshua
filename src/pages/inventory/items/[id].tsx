import axios from 'axios';
import Itable from 'components/IFlexTable';
import IFooter from 'components/IFooter'
import Inav from 'components/Inav'
import _ from 'lodash';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
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
    const session = await getSession(context);

    const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
    

    const info = await axios.get(`http://localhost:3000/api/getInfo/item/info/${context.params !== undefined ? context.params.id : ""}`)

    const stocks = await axios.get(`http://localhost:3000/api/getInfo/item/stocks/all/${info.data.data.id}`)
    
    return {
      props : { post : res.data.data, info : info.data.data, items :  info.data.items, stocks : stocks.data.data}
    }
    
}

const headerTitles = ["id", "Date", "Clients Name", "Stocks In", "Stocks Out", "Related Document", "Remarks"]

export default function index({ post, info, items, stocks}  : InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter()

  const [stock, setStocks] = useState({
      stocksVial: _.sumBy(stocks, 'stocksVial'),
      stocksBox: _.sumBy(stocks, 'stocksBox'),
      stocksBottle: _.sumBy(stocks, 'stocksBottle'),
      stocksPiece: _.sumBy(stocks, 'stocksPiece'),
  })



  const [data, setData] = useState(items.map( (item : any) => {
    const { ItemInfo, unit} = item
    return {
      id : item.id,
      date : item.SI ? item.SI.currentDate.substring(10, 0) : item.DR.currentDate.substring(10, 0),
      clientName : item.SI ? item.SI.client.clientInfo.companyName : item.DR.client.clientInfo.companyName,
      stocksIn : item.SI ? item.SI.stockIn ? item.quantity + " "  + item.unit  : "-" : item.DR.stockIn ? item.quantity + " "  + item.unit : "-",
      stocksOut : item.SI ? !item.SI.stockIn ? item.quantity + " "  + item.unit : "-" : !item.DR.stockIn ? item.quantity  + " "  + item.unit : "-",

      relatedDocument : item.sIId ? <a href={`http://localhost:3000/sales/info/${item.sIId}`}>SI : {item.sIId}</a> : <a href={`http://localhost:3000/sales/info/deliveryRecipt/${item.dRId}`}>DR : {item.dRId}</a>,
      remarks : item.SI ? item.SI.remarks : item.DR.remarks
    }
  }))





  return (
    <>
    <div className='tw-w-full tw-h-full'>
    <Inav firstName={post.employeeInfo.firstName}/>
      <div className='tw-w-full tw-flex tw-flex-col tw-pb-60'>
           <div className='tw-w-full tw-flex tw-justify-center tw-my-8'>
                <div className='tw-w-[90%] tw-flex tw-flex-col tw-gap-4'>
                    <h1 className='tw-text-2xl tw-font-bold'>{info.itemName}</h1>
                    <div>
                      <h1 className='tw-font-bold tw-text-xl'>Manufacturing Date : {info.manufacturingDate.substring(10, 0)}</h1>
                      <h1 className='tw-font-bold tw-text-xl'>Expiration Date : {info.ExpirationDate.substring(10, 0)}</h1>
                    </div>
                    <h1 className='tw-text-xl tw-font-bold'>Batch No. : {info.batchNumber}</h1>
                    <div>
                      <h1 >Vials Remaining : {stock.stocksVial}</h1>
                      <h1 >Bottles Remaining : {stock.stocksBottle}</h1>
                      <h1 >Boxes Remaining : {stock.stocksBox}</h1>
                      <h1 >Pieces Remaining : {stock.stocksPiece}</h1>
                    </div>

                </div>
                
            </div>
            <div className='tw-w-full tw-flex tw-justify-center '>
                <div className='tw-w-[90%]'>
                    <Itable allowDelete={false} headerTitles={headerTitles} data={data} editing={false} />
                </div>
            </div>
      </div>
    </div>
    <IFooter/>
  </>
  )
}
