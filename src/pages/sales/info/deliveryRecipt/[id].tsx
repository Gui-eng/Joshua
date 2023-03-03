import axios from 'axios';
import Itable from 'components/Itable';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import React from 'react'

const headerTitle = ["id", "Quantity", "Unit", "Item Name" , "Vatable", "Price", "Batch Number" , "Man. Date", "Exp. Date", "Total Amount"]


enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    PER_PIECE = 'PER_PIECE',
  }

export const getServerSideProps : GetServerSideProps = async (context) => {
    // const session = await getSession(context);
    // const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)
  
    try{
        const info = await axios.get(`http://localhost:3000/api/getInfo/deliveryRecipt/${context.query.id}`)
        return {
            props : { info : info.data }
          }
    }catch(error){
        return {
            props : {}
          }
    }
    
    
    
  }

export default function ID( {post, info} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    function getPrice(unit : UNITS, index : number) : number {
        switch(unit){
            case UNITS.BOTTLES : {
                return parseFloat(info.data.items[index].ItemInfo.priceBottle)
            }
            case UNITS.BOX : {
                return parseFloat(info.data.items[index].ItemInfo.priceBox)
            }
            case UNITS.PER_PIECE : {
                return parseFloat(info.data.items[index].ItemInfo.pricePiece)
            }
            case UNITS.VIALS : {
                return parseFloat(info.data.items[index].ItemInfo.priceVial)
            }
            default :
            return  -1
        }
    }
    

    const items = info.data.items.map((item : any, index : number) => {
        return {
            id : item.id,
            quantity : item.quantity,
            unit : item.unit,
            name : item.ItemInfo.itemName,
            vatable : item.vatable ? "Yes" : "No",
            price : getPrice(item.unit, index),
            batchNumber : item.ItemInfo.batchNumber,
            manufacturingDate : item.ItemInfo.manufacturingDate.substring(10, 0),
            expiryDate : item.ItemInfo.ExpirationDate.substring(10, 0),
            totalAmount : parseFloat(item.totalAmount)

        }
    })
    console.log(items)
    console.log(info.data)
  return (
    <div>{!info ? null : 
    <>
        <div className='tw-w-full tw-flex tw-justify-center'>
            <div className='tw-w-[90%] tw-pt-8 tw-bg-sky-600 tw-bg-opacity-30 tw-rounded-tl-lg tw-rounded-tr-lg tw-mt-4 tw-flex tw-flex-col tw-items-center'>
                <div className='tw-flex tw-w-[90%] tw-pb-4'>
                    <h1 className='tw-text-2xl tw-font-bold'>Delivery Recipt Summary</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Delivery Recipt Id : </h1><h1 className='tw-font-bold'>{info.data.id}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Date Issued : </h1><h1 className='tw-font-bold'>{info.data.currentDate.substring(10, 0)}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-[90%] tw-pb-4 tw-justify-star'><h1 >Total Amount : </h1><h1 className='tw-font-bold'>{info.data.totalAmount}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Type : </h1><h1 className='tw-font-bold'>{info.data.stockIn ? "Stock in" : "Stock Out"}</h1></div>
                </div>
            </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Itable color='blue' data={items} headerTitles={headerTitle}/>
           </div>
        </div>
    </>}</div>
  )
}
