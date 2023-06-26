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


const headerTitle = ["id", "Quantity Requested", "Quantity Issued", "Prodcut Name", "MFG. Date", "EXP Date" , "Batch Number"]


enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    CAPSULES = "CAPSULES",
    TABLETS = "TABLETS"
  }

  const data = {
    stock_number : "",
    requested_by : "",
    address : "",
    date : "",
    prepared_by : "",
    checked_by : "",


    quantity1 : "",
    name1: "",
    issued1 : "",  
    unit1: "",

    quantity2 : "",
    name2: "",
    issued2: "",  
    unit2: "",
    
    quantity3 : "",
    name3: "",
    issued3 : "",  
    unit3: "",

    quantity4 : "",
    name4: "",
    issued4 : "",  
    unit4: "",

    quantity5 : "",
    name5: "",
    issued5 : "",  
    unit5: "",

    quantity6 : "",
    name6: "",
    issued6 : "",  
    unit6: "",

    quantity7 : "",
    name7: "",
    issued7 : "",  
    unit7: "",


}

export const getServerSideProps : GetServerSideProps = async (context) => {
    // const session = await getSession(context);
    // const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
  
    try{
        const pullOutData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/inventory/stockRequest/${context.query.id}`)
        
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

    
    const router = useRouter()

    const [isPrinting, setIsPrinting] = useState(false)
    const [del, setDel] = useState(false);
    const [extra, setExtra] = useState({
      checked_by : "",
      prepared_by : "",
    })
    const [templateData, setTemplateData] = useState(data)

    useEffect(() => {

      setTemplateData(prevTemplateData => {
          let updatedTemplateData = { ...prevTemplateData };
          info.map((item: any, index: number) => {
            updatedTemplateData = {
              ...updatedTemplateData,
              [`quantity${index + 1}`]: item.quantityRequested,
              [`name${index + 1}`]: item.itemInfo.itemName,
              [`unit${index + 1}`]: item.unit,
              [`issued${index + 1}`]: item.quantityIssued,



            };
            return null; // Suppressing the warning about map() needing a return value
          });
          return updatedTemplateData;
        });
        

      setTemplateData((prevTemplateData : any) => ({
          ...prevTemplateData,
          stock_number: info[0].stockRequestNumber,
          address: info[0].deliveredAddress,
          date: formatDateString(info[0].dateRequested),
          requested_by : info[0].requestedBy.firstName + " " + info[0].requestedBy.lastName
          // prepared_by: info[0].,
      }))

    
  }, [info])
    const tableData = info.map((item : any) => {
        return {
           id : item.id,
           quantityReq : item.quantityRequested,
           quantityIssued : item.quantityIssued,
           name : item.itemInfo.itemName,
           mfgdate : formatDateString(item.itemInfo.manufacturingDate),
           expdate : formatDateString(item.itemInfo.expirationDate),
           batchNumber : item.itemInfo.batchNumber,
        }
    })

    useEffect(() => {
      setTemplateData((prevData : any) => ({
        ...prevData,
        checked_by : extra.checked_by,
        prepared_by : extra.prepared_by
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

          
          
          await axios.post(`http://${HOSTADDRESS}:${PORT}/api/inventory/stockRequest/convertToPdf`, {file : generatedDoc})
          await axios.get(`http://${HOSTADDRESS}:${PORT}/api/inventory/stockRequest/savepdf`)
          
          
      
          router.reload()
          alert("Saved Succuessfully See Reports/forms")
      } catch (error) {
          console.log('Error: ' + error);
      }
    }

    async function handleDeleteDocument(){
      try {
        const deletePOD = await axios.delete(`http://${HOSTADDRESS}:${PORT}/api/inventory/stockRequest/${info[0].stockRequestNumber}`)
        router.push('/inventory/stockRequest')
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
                    <h1 className='tw-text-2xl tw-font-bold'>Stock Request Summary</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>SR# : </h1><h1 className='tw-font-bold'>{info[0].stockRequestNumber}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Date Issued : </h1><h1 className='tw-font-bold'>{formatDateString(info[0].dateRequested)}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Requested By: </h1><h1 className='tw-font-bold'>{info[0].requestedBy.code + ' ' + info[0].requestedBy.firstName  + ' ' + info[0].requestedBy.lastName}</h1></div>
                </div>
               
            </div>
        </div>
        
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Itable color='blue' data={tableData} headerTitles={headerTitle}/>
                <Button className='tw-mt-4' color="blue" onClick={() => {setIsPrinting(isPrinting ? false : true)}}>Print</Button>
                {isPrinting ? 
                  <Form className='tw-mt-4'>
                    <FormField width={5}>
                      <label>Prepared By:</label>
                      <Input size='mini' value={extra.prepared_by} type='text' onChange={(e) => {setExtra({...extra, prepared_by : e.target.value})}} />
                    </FormField>
                    <FormField width={5}>
                      <label>Checked By:</label>
                      <Input size='mini' value={extra.checked_by} type='text' onChange={(e) => {setExtra({...extra, checked_by : e.target.value})}} />
                    </FormField>
                    <Button color='blue' onClick={(e) => {hasEmptyFields(extra) ? alert("There are empty Fields") : generateDocument(templateData, '/stockTemplate.docx')}}>Save</Button>
                  </Form>
                : null}
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
    </>
    }</div>
  )
}