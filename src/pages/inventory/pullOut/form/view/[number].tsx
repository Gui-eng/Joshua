import axios from 'axios';
import Itable from 'components/Itable';
import { HOSTADDRESS, PORT, formatCurrency, formatDateString, getPrice, handleUndefined } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { saveAs } from 'file-saver';
import dynamic from 'next/dynamic';

import { Item } from 'types';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { Button, Header } from 'semantic-ui-react';
import { isArrayBuffer, isBuffer } from 'lodash';
import printJS from 'print-js';
import { useRouter } from 'next/router';
import Link from 'next/link';

import  { Document, Page} from 'react-pdf'
import path from 'path';



const headerTitle = ["id", "SI #", "Quantity", "Prodcut Name", "MFG. Date", "EXP Date" , "Batch Number", "Amount"]


enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    CAPSULES = "CAPSULES",
    TABLETS = "TABLETS"
  }

  const data = {
    pullout_number : "",
    company_name : "",
    address : "",
    date : "",

    number1 : "",
    quantity1 : "",
    name1: "",
    mfg1: "",
    exp1: "",
    batch1: "",
    amount1 : "",  

    number2 : "",
    quantity2 : "",
    name2: "",
    mfg2: "",
    exp2: "",
    batch2: "",
    amount2 : "",  

    number3 : "",
    quantity3 : "",
    name3: "",
    mfg3: "",
    exp3: "",
    batch3: "",
    amount3 : "",  

    number4 : "",
    quantity4 : "",
    name4: "",
    mfg4: "",
    exp4: "",
    batch4: "",
    amount4 : "", 

    number5 : "",
    quantity5 : "",
    name5: "",
    mfg5: "",
    exp5: "",
    batch5: "",
    amount5 : "", 

    number6 : "",
    quantity6 : "",
    name6: "",
    mfg6: "",
    exp6: "",
    batch6: "",
    amount6 : "", 

    number7 : "",
    quantity7 : "",
    name7: "",
    mfg7: "",
    exp7: "",
    batch7: "",
    amount7 : "", 

    e :"",
    r : "",
    n:"",

    total: "",
}

export const getServerSideProps : GetServerSideProps = async (context) => {
    // const session = await getSession(context);
    // const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
  
    try{
        const pullOutData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/pullOut/${context.query.number}`)
        
        return {
            props : { info : pullOutData.data.data }
          }
    }catch(error){
        return {
            props : {}
          }
    }
    
    
    
  }

export default function ID( {post, info} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    const router = useRouter();
    const [del, setDel] = useState(false);

    // !info ? null
    const [templateData, setTemplateData] = useState(data);
    const [buffer, setBuffer] = useState<any>()
    const [savePath, setSavePath] = useState<string | undefined>("");

    useEffect(() => {
        let total = 0;
        setTemplateData(prevTemplateData => {
            let updatedTemplateData = { ...prevTemplateData };
            info.map((item: any, index: number) => {

              total += Number(item.totalAmount);

              updatedTemplateData = {
                ...updatedTemplateData,
                [`number${index + 1}`]: item.documentNumber,
                [`quantity${index + 1}`]: item.quantity,
                [`name${index + 1}`]: item.itemName,
                [`mfg${index + 1}`]: formatDateString(item.manufacturingDate),
                [`exp${index + 1}`]: formatDateString(item.expirationData),
                [`batch${index + 1}`]: item.batchNumber,
                [`amount${index + 1}`]: '₱ ' + formatCurrency(item.totalAmount),
              };
              return null; // Suppressing the warning about map() needing a return value
            });
            return updatedTemplateData;
          });
          

        setTemplateData((prevTemplateData : any) => ({
            ...prevTemplateData,
            e : info[0].status === "EXPIRED" ? "✓" : "",
            n : info[0].status === "NEAR EXPIRY" ? "✓" : "",
            r : info[0].status === "FOR REPLACEMENT" ? "✓" : "",
            pullout_number: info[0].pullOutNumber,
            company_name: info[0].client.companyName,
            address: info[0].client.address,
            date: formatDateString(info[0].dateIssued),
            total :  '₱ ' + formatCurrency(total.toString())
            // prepared_by: info[0].,
        }))
      
    }, [info])

      
  

    
    async function generateDocument(resume : any, templatePath : any) {
        // load the document template into docxtemplater
        try {
            let response = await fetch(templatePath);
            let data = await response.arrayBuffer();
    
            let zip = new PizZip(data);
    
            let templateDoc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true
            })
    
            templateDoc.render(resume);
    
            let generatedDoc = templateDoc.getZip().generate({
                type: "base64",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                compression: "DEFLATE"
            })

            
            
            await axios.post(`http://${HOSTADDRESS}:${PORT}/api/convertToPdf`, {file : generatedDoc})
            await axios.get(`http://${HOSTADDRESS}:${PORT}/api/savepdf`)
            
            
        
            router.reload()
            alert("Saved Succuessfully See Reports/forms")
        } catch (error) {
            console.log('Error: ' + error);
        }
      }

    
      
    

    const tableData = info.map((item : any) => {
        return {
        id : item.id,
           number : item.documentNumber,
           quantity : item.quantity + " " + item.unit,
           name : item.itemName,
           mfgdate : item.manufacturingDate.substring(10, 0),
           expdate : item.expirationData.substring(10, 0),
           batchNumber : item.batchNumber,
           amount : formatCurrency(item.totalAmount)
        }
    })
    
    async function handleDeleteDocument(){
      try {
        const deletePOD = await axios.delete(`http://${HOSTADDRESS}:${PORT}/api/pullOut/${info[0].pullOutNumber}`)
        router.push('/inventory/pullOut')
      } catch (error) {
        console.log(error)
      }
  }

    
  return (
    <div>{
    <>
         <div className='tw-w-full tw-flex tw-justify-center'>
            <div className='tw-w-[90%] tw-pt-8 tw-bg-sky-600 tw-bg-opacity-30 tw-rounded-tl-lg tw-rounded-tr-lg tw-mt-4 tw-flex tw-flex-col tw-items-center'>
                <div className='tw-flex tw-w-[90%] tw-pb-4'>
                    <h1 className='tw-text-2xl tw-font-bold'>Pull Out Summary</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>PO# : </h1><h1 className='tw-font-bold'>{info[0].pullOutNumber}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Date Issued : </h1><h1 className='tw-font-bold'>{info[0].dateIssued.substring(10, 0)}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Company Name : </h1><h1 className='tw-font-bold'>{info[0].client.companyName }</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Company Address: </h1><h1 className='tw-font-bold'>{info[0].client.address}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-[90%] tw-pb-4 tw-justify-start'><h1 >Total Amount : </h1><h1 className='tw-font-bold'>{parseFloat(info[0].totalAmount.toString()).toLocaleString()}</h1></div>
                    {/* <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Type : </h1><h1 className='tw-font-bold'></h1></div> */}
                </div>
               
            </div>
        </div>

       
        
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Itable color='blue' data={tableData} headerTitles={headerTitle}/>
                <Button color='blue' onClick={() => {info.length <= 7 ? (generateDocument(templateData, '/pulloutTemplate.docx')) : alert('Item cannot be more than 7 please edir the file')}}>Print</Button>
                <div className='tw-w-full tw-flex tw-justify-end tw-pt-4'>
                    
                    {!del ?  <Button className='' color='red' inverted onClick={() => { setDel(true)}}>Delete</Button> : null}
                    
                    {del ? <div className='tw-flex-col tw-justify-end'>
                            <Header as='h5' className='tw-pr-2'>Are you sure to delete?</Header>
                            <div className='tw-flex'>
                                <Button className='' color='red' inverted onClick={() => { handleDeleteDocument()}}>Yes</Button> 
                                <Button className='' color='blue' inverted onClick={() => { setDel(false)}}>No</Button>
                            </div>
                    </div>: null}

                 </div>
           </div>
                
        </div>
    </>}</div>
  )
}
