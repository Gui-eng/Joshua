import axios from 'axios';
import Itable from 'components/Itable';
import Docxtemplater from 'docxtemplater';
import { HOSTADDRESS, PORT, formatCurrency, formatDateString, getPrice, handleUndefined, hasEmptyFields } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import PizZip from 'pizzip';
import React, { useEffect, useState } from 'react'
import { Button, Form, FormField, Header, Input } from 'semantic-ui-react';
import { Item } from 'types';

const headerTitle = ["id", "Quantity", "Prodcut Name", "MFG. Date", "EXP Date" , "Batch Number"]


enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    CAPSULES = "CAPSULES",
    TABLETS = "TABLETS"
  }

  const data = {
    number : "",
    companyName : "",
    address : "",
    date : "",
    tin: "",

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
  }

export const getServerSideProps : GetServerSideProps = async (context) => {
    // const session = await getSession(context);
    // const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
  
    try{
        const pullOutData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/inventory/proofOfDelivery/${context.query.id}`)
        
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

  const [templateData, setTemplateData] = useState(data)
  const router = useRouter()

  const [isPrinting, setIsPrinting] = useState(false)
  const [del, setDel] = useState(false);
  const [extra, setExtra] = useState({
    approvedBy : "",
    preparedBy : "",
  })

    useEffect(() => {
      setTemplateData(prevTemplateData => {
          let updatedTemplateData = { ...prevTemplateData };
          info.map((item: any, index: number) => {
            console.log(item)
            updatedTemplateData = {
              ...updatedTemplateData,
              [`quantity${index + 1}`]: item.quantity,
              [`name${index + 1}`]: item.itemInfo.itemName,
              [`mfg${index + 1}`]: formatDateString(item.itemInfo.manufacturingDate),
              [`exp${index + 1}`]: formatDateString(item.itemInfo.expirationDate),
              [`batch${index + 1}`]: item.itemInfo.batchNumber,
            };
            return null; // Suppressing the warning about map() needing a return value
          });
          return updatedTemplateData;
        });
        
       
      setTemplateData((prevTemplateData : any) => ({
          ...prevTemplateData,

          number: info[0].proofOfDeliveryNumber,
          companyName: info[0].deliveredClient.companyName,
          address: info[0].deliveredClient.address,
          date: formatDateString(info[0].dateRequested),
          tin : info[0].deliveredClient.TIN,
      }))
    
  }, [info])

    useEffect(() => {
      setTemplateData((prevData : any) => ({
        ...prevData,
        approvedBy : extra.approvedBy,
        preparedBy : extra.preparedBy
      }))
    }, [extra])
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

          
          
          await axios.get(`http://${HOSTADDRESS}:${PORT}/api/inventory/proofOfDelivery/savepdf`)
          
          
      
          router.reload()
          alert("Saved Succuessfully See Reports/forms")
      } catch (error) {
          console.log('Error: ' + error);
      }
    }

    const tableData = info.map((item : any) => {
        return {
           id : item.id,
           quantity : item.quantity,
           name : item.itemInfo.itemName,
           mfgdate : formatDateString(item.itemInfo.manufacturingDate),
           expdate : formatDateString(item.itemInfo.expirationDate),
           batchNumber : item.itemInfo.batchNumber,
        }
    })

    async function handleDeleteDocument(){
        try {
          const deletePOD = await axios.delete(`http://${HOSTADDRESS}:${PORT}/api/inventory/proofOfDelivery/${info[0].proofOfDeliveryNumber}`)
          router.push('/inventory/proofOfDelivery')
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
                    <h1 className='tw-text-2xl tw-font-bold'>Proof Of Delivery Summary</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>POD# : </h1><h1 className='tw-font-bold'>{info[0].proofOfDeliveryNumber}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Date Issued : </h1><h1 className='tw-font-bold'>{formatDateString(info[0].dateRequested)}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Company Name : </h1><h1 className='tw-font-bold'>{info[0].deliveredClient.companyName }</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Company Address: </h1><h1 className='tw-font-bold'>{info[0].deliveredClient.address}</h1></div>
                </div>
               
            </div>
        </div>
        
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Itable color='blue' data={tableData} headerTitles={headerTitle}/>
           </div>
        </div>

        <div className='tw-w-full tw-flex tw-justify-end tw-pr-20 tw-pt-4'>
                    
                    {!del ?  <Button className='' color='red' inverted onClick={() => { setDel(true)}}>Delete</Button> : null}
                    
                    {del ? <div className='tw-flex-col tw-justify-end'>
                            <Header as='h5' className='tw-pr-2'>Are you sure to delete?</Header>
                            <div className='tw-flex'>
                                <Button className='' color='red' inverted onClick={() => { handleDeleteDocument()}}>Yes</Button> 
                                <Button className='' color='blue' inverted onClick={() => { setDel(false)}}>No</Button>
                            </div>
                    </div>: null}

        </div>

        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Button className='tw-mt-4' color="blue" onClick={() => {setIsPrinting(isPrinting ? false : true)}}>Print</Button>
                {isPrinting ? 
                  <Form className='tw-mt-4'>
                    <FormField width={5}>
                      <label>Prepared By:</label>
                      <Input size='mini' value={extra.preparedBy} type='text' onChange={(e) => {setExtra({...extra, preparedBy : e.target.value})}} />
                    </FormField>
                    <FormField width={5}>
                      <label>Approved By:</label>
                      <Input size='mini' value={extra.approvedBy} type='text' onChange={(e) => {setExtra({...extra, approvedBy : e.target.value})}} />
                    </FormField>
                    <Button color='blue' onClick={(e) => {hasEmptyFields(extra) ? alert("There are empty Fields") : generateDocument(templateData, '/POD.docx')}}>Save</Button>
                  </Form>
                : null}
           </div>
        </div>
    </>
    }</div>
  )
}
