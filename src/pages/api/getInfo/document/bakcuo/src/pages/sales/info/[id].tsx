import axios from 'axios';
import Itable from 'components/Itable';
import { HOSTADDRESS, PORT, formatCurrency, formatDateString, getPrice, handleUndefined } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button } from 'semantic-ui-react';
import { Item } from 'types';
import template from './../../../../public/newsiTemplate.docx'
import template1 from './../../../../public/oldsiTemplate.docx'
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';


const headerTitle = ["id", "Quantity", "Unit", "Item Name" , "Vatable", "Price", "Batch Number" , "Man. Date", "Exp. Date", "Net Amount"]


enum UNITS {
    BOX = 'BOXES',
    VIALS = 'VIALS',
    BOTTLES = 'BOTTLES',
    CAPSULES = "CAPSULES",
    TABLETS = "TABLETS"
  }


  const data = {
    client : "",
    term: "",
    address : "",
    date : "",
    vatS : "",
    vatE : "",
    zsales : "",
    vamount : "",
    tsales : "",
    lvat : "",
    nvat : "",
    disc : "",
    adue : "",
    avat : "",
    tdue : "",
    prepared_by : "",
TIN : "",

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

   
}

export const getServerSideProps : GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`)

    try{
        const info = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/salesInvoice/${context.query.id}`)
        return {
            props : { info : info.data.data }
          }
    }catch(error){
        return {
            props : {}
          }
    }
    
    
    
  }

  
 


export default function ID( {post, info} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    console.log(info)
   
    // !info ? null
    const router = useRouter()

    const [templateData, setTemplateData] = useState(data)


    useEffect(() => {

        let nonvat : any = {
            vatS : 0,
            vatE: 0,
            zsales : 0,
            vamount: 0,
            tdue : 0,
            adue : 0
        }

        let allvat : any = {
            tsales : 0,
            lvat : 0,
            nvat : 0,
            disc : 0,
            adue : 0,
            avat : 0,
            tdue : 0,
        }


        setTemplateData(prevTemplateData => {
            let updatedTemplateData = { ...prevTemplateData };
            info.items.map((item: any, index: number) => {

              if(info.items.some((item : any) => {
                return item.vatable === false
              })){

                if(item.ItemSalesDetails[0].vatExempt){

		   
                    nonvat = {
                        ...nonvat,
                        tdue : nonvat.tdue + Number(item.ItemSalesDetails[0].netAmount),
                        vatE : nonvat.vatE + Number(item.ItemSalesDetails[0].netAmount),
                        adue : nonvat.adue + Number(item.ItemSalesDetails[0].netAmount),
                        
                    }
                  }else{
                    nonvat = {
                        ...nonvat,
                        tdue : nonvat.tdue + Number(item.ItemSalesDetails[0].netAmount),
                        vatS : nonvat.vatS + Number(item.ItemSalesDetails[0].netAmount),
                        vamount : nonvat.vamount + Number(item.ItemSalesDetails[0].VATAmount),
                        adue : nonvat.adue + Number(item.ItemSalesDetails[0].netAmount),

                    }
                  }
              }else{
 		    const vatAmount = Number(item.ItemSalesDetails[0].netAmount) / 1.12 * 0.12
                    allvat = {
                        tsales : allvat.tsales + Number(item.ItemSalesDetails[0].netAmount),
                        lvat : allvat.tsales + vatAmount,
                        nvat : allvat.nvat + Number(item.ItemSalesDetails[0].netAmount) - vatAmount,
                        disc : 0,
                        adue : allvat.adue + Number(item.ItemSalesDetails[0].netAmount),
                        avat : allvat.avat + vatAmount,
                        tdue : allvat.tdue + Number(item.ItemSalesDetails[0].netAmount),
                    }
              }

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
                    [`d${index + 1}`]: (item.discount * 100) + "%",
                    [`price${index + 1}`]:  getThePrice?.toLocaleString(),
                    [`amount${index + 1}`]: '₱ ' + formatCurrency(item.ItemSalesDetails[0].netAmount.toString()),
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
	    TIN : info.client.clientInfo.TIN,
            address :  info.client.clientInfo.address,
            date : formatDateString(info.dateIssued.toString()),
            prepared_by : info.preparedBy.employeeInfo.firstName + " " + info.preparedBy.employeeInfo.lastName,
        }))


        setTemplateData((prevTemplateData : any) => {
            nonvat = {
                tdue : nonvat.tdue === 0 ? "" : formatCurrency(nonvat.tdue.toString()),
                vamount : nonvat.vamount  === 0 ? "" : formatCurrency(nonvat.vamount.toString()),
                vatE : nonvat.vatE === 0 ? "" : formatCurrency(nonvat.vatE.toString()),
                vatS : nonvat.vatS  === 0 ? "" : formatCurrency(nonvat.vatS.toString()),
                adue : nonvat.adue  === 0 ? "" : formatCurrency(nonvat.adue.toString()),
                zsales : nonvat.zsales  === 0 ? "" : formatCurrency(nonvat.zsales.toString()),
            }

            allvat = {
                adue : allvat.adue  === 0 ? "" : formatCurrency(allvat.adue.toString()),
                disc : allvat.disc  === 0 ? "" : formatCurrency(allvat.disc.toString()),
                avat : allvat.avat  === 0 ? "" : formatCurrency(allvat.avat.toString()),
                lvat : allvat.lvat  === 0 ? "" : formatCurrency(allvat.lvat.toString()),
                nvat : allvat.nvat  === 0 ? "" : formatCurrency(allvat.nvat.toString()),
                tdue : allvat.tdue  === 0 ? "" : formatCurrency(allvat.tdue.toString()),
                tsales : allvat.tsales  === 0 ? "" : formatCurrency(allvat.tsales.toString()),
     
            }


            const total = info.items.some((item : any) => {
                return item.vatable === false
              }) ? nonvat : allvat

              
            return {
                ...prevTemplateData,
                ...total,
                [`n${info.items.length}`] : "*********NOTHING FOLLOWS**********"
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
  
            
            
            await axios.post(`http://${HOSTADDRESS}:${PORT}/api/sales/convertToPdf`, {file : generatedDoc})
            await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/savepdf`)
            
            
        
            router.reload()
            alert("Saved Succuessfully See Reports/forms")
        } catch (error) {
            console.log('Error: ' + error);
        }
      }


    async function handlePrint(newSI : Boolean){
        if(newSI){
            await axios.post(`http://${HOSTADDRESS}:${PORT}/api/getInfo/document/salesInvoice/new/print`, info)
        }else{
            await axios.post(`http://${HOSTADDRESS}:${PORT}/api/getInfo/document/salesInvoice/old/print`, info)
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
            price: getThePrice?.toLocaleString(),
            batchNumber: item.ItemInfo?.batchNumber,
            manDate: formatDateString(item.ItemInfo?.manufacturingDate.toString()),
            expDate: formatDateString(item.ItemInfo?.expirationDate.toString()),
            totalAmount: formatCurrency(item.ItemSalesDetails[0].netAmount.toString())
          }
    })
    
  return (
    <div>{
    <>
        <div className='tw-w-full tw-flex tw-justify-center'>
            <div className='tw-w-[90%] tw-pt-8 tw-bg-sky-600 tw-bg-opacity-30 tw-rounded-tl-lg tw-rounded-tr-lg tw-mt-4 tw-flex tw-flex-col tw-items-center'>
                <div className='tw-flex tw-w-[90%] tw-pb-4'>
                    <h1 className='tw-text-2xl tw-font-bold'>Sales Invoice Summary</h1>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg'>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>Sales Invoice # : </h1><h1 className='tw-font-bold'>{info.salesInvoiceNumber}</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Date Issued : </h1><h1 className='tw-font-bold'>{info.dateIssued.substring(10,0)}</h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-start'><h1>PMR/ Medical Representative : </h1><h1 className='tw-font-bold'>{info.pmr.employeeInfo.code + " " + info.pmr.employeeInfo.firstName + " " + info.pmr.employeeInfo.lastName }</h1></div>
                    <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Prepared By : </h1>{info.preparedBy.employeeInfo.firstName + " " + info.preparedBy.employeeInfo.lastName}<h1 className='tw-font-bold'></h1></div>
                </div>
                <div className='tw-w-[90%] tw-pb-4 tw-flex tw tw-justify-center tw-items-center tw-text-lg '>
                    <div className='tw-flex tw-gap-1 tw-w-[90%] tw-pb-4 tw-justify-start'><h1 >Total Amount : </h1><h1 className='tw-font-bold'>{parseFloat(info.totalAmount).toLocaleString()}</h1></div>
                    {/* <div className='tw-flex tw-gap-1 tw-w-full tw-justify-end'><h1>Type : </h1><h1 className='tw-font-bold'></h1></div> */}
                </div>
               
            </div>
        </div>
        <div className='tw-w-full tw-flex tw-justify-center'>
           <div className='tw-w-[90%]'>
                <Itable color='blue' data={tableData} headerTitles={headerTitle}/>
                <div className='tw-mt-4'>
                    <Button onClick={() => {generateDocument(templateData, template)}}color='blue'>Print SI &#40;New&#41;</Button>
                    <Button onClick={() => {generateDocument(templateData, template1)}}color='blue'>Print SI &#40;Old&#41;</Button>
                    <Button onClick={() => {router.push(`/sales/add/editSI/${info.id}`)}}color='blue'>Edit</Button>
                </div>
           </div>
        </div>
    </>}</div>
  )
}