import axios from 'axios';
import Itable from 'components/InvoiceTable';
import { HOSTADDRESS, PORT, formatCurrency, formatDateString, getPrice, handleUndefined, salesRecord } from 'functions';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { Button, Header, Loader } from 'semantic-ui-react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import newsi from '../../../../public/docs/newsiTemplate.docx'
import oldsi from '../../../../public/docs/oldsiTemplate.docx'


import path from 'path';

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
    TIN : "",
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
    const res = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)

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

   
    // !info ? null
    const router = useRouter()
    

    const [templateData, setTemplateData] = useState(data)
    const [del, setDel] = useState(false);
    const [sales, setSales]  = useState();

    const [loading, setLoading] = useState(false)

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
                    allvat = {
                        tsales : allvat.tsales + Number(item.ItemSalesDetails[0].netAmount),
                        lvat : allvat.tsales + Number(item.ItemSalesDetails[0].VATAmount),
                        nvat : allvat.nvat + Number(item.ItemSalesDetails[0].netVATAmount),
                        disc : 0,
                        adue : allvat.adue + Number(item.ItemSalesDetails[0].netAmount),
                        avat : allvat.avat + Number(item.ItemSalesDetails[0].VATAmount),
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

  
    useEffect(() => {
        const tableDataSales = info.items.map((items : any) => {
            const item = items.ItemSalesDetails.map((sale : any) => {
                return {
                    discount : Number(sale.discount),
                    totalAmount : Number(sale.grossAmount),
                    vatable : !sale.vatExempt,
                    id : sale.itemId
                }
            })[0]


            const discount = handleUndefined(item.discount)
            const grossAmount = item.totalAmount
            const netAmount = grossAmount - (grossAmount * discount)
            const VATAmount = netAmount / 1.12 * 0.12
      
            const data = {
              itemId :  handleUndefined(item.id),
              grossAmount :  Math.round(grossAmount  * 100) / 100 ,
              discount : discount || 0,
              netAmount : Math.round(netAmount * 100) / 100,
              VATAmount : item.vatable ? Math.round(VATAmount * 100) / 100 : 0, 
              vatable : item.vatable,
            }
      
            return data
          })
          

          setSales(tableDataSales)

          
    }, [])

    async function generateDocument(resume : any, templatePath : any) {
        // load the document template into docxtemplater
      
        try {
            setLoading(true)
          
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
            await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/printSI`)
            setLoading(false)
        
            router.reload()
            alert("Saved Succuessfully See Reports/forms")
        } catch (error) {
            console.log('Error: ' + error);
            setLoading(false)
        }
      }
    



    async function handleDeleteDocument() {
        try {
            const res = await axios.post(`http://${HOSTADDRESS}:${PORT}/api/sales/deleteSI`, info)
            router.push(`/sales/info/salesInvoice`)
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
                {sales !== undefined ? <Itable color='blue' data={tableData} allowDelete={false} headerTitles={headerTitle} extraData={sales}/> : null}
                {!loading ?  <div className='tw-mt-4'>
                    <Button onClick={() => {generateDocument(templateData, newsi)}}color='blue'>Print SI &#40;New&#41;</Button>
                    <Button onClick={() => {generateDocument(templateData, oldsi)}}color='blue'>Print SI &#40;Old&#41;</Button>
                    <Button onClick={() => {router.push(`/sales/add/editSI/${info.id}`)}}color='blue'>Edit</Button>
                </div> : <Loader active/>}
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
