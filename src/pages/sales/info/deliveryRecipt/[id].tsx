import axios from 'axios';
import Itable from 'components/Itable';
import { HOSTADDRESS, PORT, formatCurrency, formatDateString, getPrice, handleUndefined } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { Button, Header } from 'semantic-ui-react';
import { Item } from 'types';
import template from './../../../../../public/olddrTemplate.docx'
import template1 from './../../../../../public/newdrTemplate.docx'
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { useRouter } from 'next/router';

const headerTitle = ["id", "Quantity", "Unit", "Item Name" , "Vatable", "Price", "Batch Number" , "Man. Date", "Exp. Date", "Total Amount"]


enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    CAPSULES = "CAPSULES",
    TABLETS = "TABLETS"
  }

export const getServerSideProps : GetServerSideProps = async (context) => {

    try{
        const info = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/deliveryRecipt/${context.query.id}`)
        return {
            props : { info : info.data.data }
          }
    }catch(error){
        return {
            props : {}
          }
    }
    
    
    
  }


  const data = {
    client : "",
    term: "",
    address : "",
    date : "",
    tdue : "",
    prepared_by : "",

    unit1 : "",
    qty1 : "",
    name1: "",
    mg1: "",
    exp1: "",
    batch1: "",
    amount1 : "",  
    d1 :"",
    price1 : "",

    unit2 : "",
    qty2 : "",
    name2: "",
    mg2: "",
    exp2: "",
    batch2: "",
    amount2 : "",  
    d2 :"",
    price2 : "",

    unit3 : "",
    qty3 : "",
    name3: "",
    mg3: "",
    exp3: "",
    batch3: "",
    amount3 : "",  
    d3 :"",
    price3 : "",


    unit4 : "",
    qty4 : "",
    name4: "",
    mg4: "",
    exp4: "",
    batch4: "",
    amount4 : "", 
    d4 :"",
    price4 : "",

    n1 : "",
    n2 : "",
    n3 : "",
    n4 : "",

    r1 : "",
    r2 : "",
    r3 : "",
    r4 : "",


   
}

export default function ID( {post, info} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [templateData, setTemplateData] = useState(data)
    const [del, setDel] = useState(false);

    const router = useRouter()

    console.log(info)

    useEffect(() => {

        let tdue = 0;


        setTemplateData(prevTemplateData => {
            let updatedTemplateData = { ...prevTemplateData };
            info.items.map((item: any, index: number) => {


              const getThePrice = getPrice(handleUndefined(item.ItemInfo?.ItemPrice[0]), item.unit)
            
               if(item.ItemInfo !== undefined) {
                updatedTemplateData = {
                    ...updatedTemplateData,
                    [`qty${index + 1}`]: item.quantity,
                    [`unit${index + 1}`]: item.unit,
                    [`name${index + 1}`]: item.ItemInfo?.itemName,
                    [`mg${index + 1}`]: "MFG DATE: " + formatDateString(item.ItemInfo.manufacturingDate.toString()),
                    [`exp${index + 1}`]: "EXP DATE: " + formatDateString(item.ItemInfo.expirationDate.toString()),
                    [`batch${index + 1}`]: "LOT/BATCH NO. :" +  item.ItemInfo.batchNumber,
                    [`d${index + 1}`]: item.ItemSalesDetails[0].netAmount > 0 ? (item.discount * 100) + "%" : "",
                    [`amount${index + 1}`]: item.ItemSalesDetails[0].netAmount > 0 ? '₱ ' + formatCurrency(item.ItemSalesDetails[0].netAmount.toString()) : "-",
                  };
               }
              
              return null; // Suppressing the warning about map() needing a return value
            });
            return updatedTemplateData;
          });
          
  
        setTemplateData((prevTemplateData : any) => ({
            ...prevTemplateData,
            client : info.client.clientInfo.companyName,
            term: info.term,
            address :  info.client.clientInfo.address,
            date : formatDateString(info.dateIssued.toString()),
            prepared_by : info.preparedBy.employeeInfo.firstName + " " + info.preparedBy.employeeInfo.lastName,
        }))


        setTemplateData((prevTemplateData : any) => { 
            return {
                ...prevTemplateData,
                tdue : Number(info.totalAmount) > 0 ? '₱ ' + formatCurrency(info.totalAmount) : "-",
                [`n${info.items.length}`] : "*********NOTHING FOLLOWS**********",
                [`r${info.items.length}`] : info.remarks

            }
        })

        
  
      
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
  
            
            
            await axios.post(`http://${HOSTADDRESS}:${PORT}/api/sales/dr/convertToPdf`, {file : generatedDoc})
            await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/dr/savepdf`)
            await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/printDR`)

            
            
        
            router.reload()
            alert("Saved Succuessfully See Reports/forms")
        } catch (error) {
            console.log('Error: ' + error);
        }
      }

    async function handleDeleteDocument() {
        try {
            const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/sales/deleteDR`, info)
            router.push(`/sales/info/deliveryRecipt`)
        } catch (error) {
            console.log(error)
        }
    }

    const tableData = info.items.map((item : any) => {

        const getThePrice = getPrice(handleUndefined(item.ItemInfo?.ItemPrice[0]), item.unit)

        return {
            id: item.id,
            quantity: parseFloat(item.quantity.toString()).toLocaleString(),
            unit: item.unit,
            itemName: item.ItemInfo?.itemName,
            vatable: item.vatable ? 'Yes' : 'No',
            price: formatCurrency(handleUndefined(getThePrice?.toString())),
            batchNumber: item.ItemInfo?.batchNumber,
            manDate: formatDateString(item.ItemInfo?.manufacturingDate.toString()),
            expDate: formatDateString(item.ItemInfo?.expirationDate.toString()),
            totalAmount: formatCurrency(item.ItemSalesDetails[0].netAmount.toString())
          }
    })
    
    async function handlePrint(newDR : Boolean){
        if(!newDR){
            await generateDocument(templateData, template)
        }else{
            await generateDocument(templateData, template1)
        }
    }


  return (
    <div>{
    <>
        <div className='tw-w-full tw-flex tw-justify-center'>
            <div className='tw-w-[90%] tw-pt-8 tw-bg-sky-600 tw-bg-opacity-30 tw-rounded-tl-lg tw-rounded-tr-lg tw-mt-4 tw-flex tw-flex-col tw-items-center'>
                <div className='tw-flex tw-w-[90%] tw-pb-4'>
                    <h1 className='tw-text-2xl tw-font-bold'>Delivery Recipt Summary</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Delivery Recipt # : </h1><h1 className='tw-font-bold'>{info.deliveryReciptNumber}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Date Issued : </h1><h1 className='tw-font-bold'>{info.dateIssued.substring(10,0)}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>PMR/ Medical Representative : </h1><h1 className='tw-font-bold'>{info.pmr.employeeInfo.code + " " + info.pmr.employeeInfo.firstName + " " + info.pmr.employeeInfo.lastName }</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Prepared By : </h1>{info.preparedBy.employeeInfo.firstName + " " + info.preparedBy.employeeInfo.lastName}<h1 className='tw-font-bold'></h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                <div className='tw-flex tw-gap-1 tw-w-[100%] tw-pb-4 tw-justify-start'><h1 >Total Amount : </h1><h1 className='tw-font-bold'>{formatCurrency(info.totalAmount)}</h1></div>
                    {/* <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Type : </h1><h1 className='tw-font-bold'></h1></div> */}
                </div>
               
            </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Itable color='blue' data={tableData} headerTitles={headerTitle}/>
                <div className='tw-mt-4'>
                    <Button onClick={() => {handlePrint(true)}}color='blue'>Print DR &#40;New&#41;</Button>
                    <Button onClick={() => {handlePrint(false)}}color='blue'>Print DR &#40;Old&#41;</Button>
                    <Button onClick={() => {router.push(`/sales/add/editDR/${info.id}`)}}color='blue'>Edit</Button>

                </div>
                <div className='tw-full tw-flex tw-justify-end'>
                    
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
