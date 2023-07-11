import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Container, Dropdown, Form, FormField, Header, Input, Label } from 'semantic-ui-react'
import Itable from 'components/IFlexTable'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import axios, { AxiosResponse } from 'axios'
import { getSession } from 'next-auth/react'
import { CollectionData, ClientInfo, SalesInvoiceData, Option } from 'types'
import { NextRouter, useRouter } from 'next/router'
import { filterRecords, salesRecord, handleOptionsChange, handleUndefined, makeOptions, filterSalesInvoices, fetchBalance, formatCurrency, makeOptionsForFilter, handleFilteredOptionsChange, HOSTADDRESS, PORT } from 'functions'

export const getServerSideProps : GetServerSideProps = async (context) => {
    
    let selectedDocument : AxiosResponse<any, any>;
    const session = await getSession(context);
    const usr = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/${session?.user?.email}`)
    const clients = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/client`)
    const salesInvoiceData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/view`)
    const deliveryReciptData = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/sales/viewDR`)
    
    const documentData = [...salesInvoiceData.data.data, ...deliveryReciptData.data.data]

    selectedDocument = await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/deliveryRecipt/${context.query.id}`).catch( async () => {
     return await axios.get(`http://${HOSTADDRESS}:${PORT}/api/getInfo/salesInvoice/${context.query.id}`)
    })
  
    

    return {
      props : {user : usr.data.data, clients : clients.data.data, salesInvoiceData : documentData , selectedDocument : selectedDocument.data.data}
    }
}



const categoryOption : Option[] = [
    { id : 'categoryOption', key:'paid' , value : "unpaid", text : 'Unpaid'},
    { id : 'categoryOption', key:'unpaid' , value : "paid", text : 'Paid'},
    { id : 'categoryOption', key:'both' , value : "unpaid/paid", text : 'Unpaid/Paid'},

]





export default function add({ user, clients, salesInvoiceData, selectedDocument} : InferGetServerSidePropsType<typeof getServerSideProps>) {

    const router = useRouter()



    const [salesInvoiceNumberOptions, setSalesInvoiceNumberOptions] = useState<any>([])
    const [totalBalance, setTotalBalance] = useState(0)

    const clientsOption = makeOptions(clients, 'companyId', ['companyName'])
    

    const [rawData, setRawData] = useState<any>({
        companyId : selectedDocument.client.clientInfo.id,
        salesInvoiceNumber : selectedDocument.id,
        balance : selectedDocument.balance,
        selectedDocument : selectedDocument,
        categoryOption : 'unpaid',
        
    })


    const [selectedDocumentTableData, setSelectedDocumentTableData] = useState<Array<any>>([salesRecord(rawData.selectedDocument, router)])
    const [moreTableData, setMoreTableData] = useState<Array<any>>(filterRecords(salesInvoiceData, rawData, router))


    
    

    useEffect(() => {
        const filter = salesInvoiceData.filter((item : any) => {
            return item.client.clientInfo.id === rawData.companyId
        })
        const selectedDoc = selectedDocument || {}; // handle case where selectedDocument is undefined
        const valueParam = selectedDoc.salesInvoiceNumber !== undefined ? 'salesInvoiceNumber' : 'deliveryReciptNumber';
        const textElems = [valueParam];
        
        if (valueParam === 'salesInvoiceNumber') {
          textElems.push('deliveryReciptNumber');
        } else {
          textElems.push('salesInvoiceNumber');
        }

        
        const options = makeOptionsForFilter(filter, valueParam, textElems,);
        setSalesInvoiceNumberOptions(options);

    }, [rawData])

    const memoizedFilterSalesInvoices = useMemo(() => {
      return (salesInvoiceData: any, rawData: any, router: any, paid: boolean = false, both: boolean = false) => {
        // Filter the sales invoice data to include only those for the current company and exclude the current sales invoice number
        const filteredItems = salesInvoiceData.filter((item: any) => {
          return item.client.clientInfo.id === rawData.companyId && item.id !== rawData.salesInvoiceNumber;
        })
        // Filter the sales invoice data to include only paid or unpaid sales invoices based on the specified criteria
        .filter((item: any) => {
          // If both is true, return all sales invoices
          if (both) {
            return true;
          }
          // Otherwise, return only paid or unpaid sales invoices based on the specified criteria
          return item.isPaid === paid;
        })
        // Map the filtered sales invoice data to a new array of sales record data
        .map((item: any) => {
          return salesRecord(item, router);
        });
    
        // Return the filtered array of sales invoice data
        return filteredItems;
      }
    }, [router]);
    
    // Use the memoized function in the effect hook
    useEffect(() => {
      switch (rawData.categoryOption) {
        case 'unpaid': {
          setMoreTableData(memoizedFilterSalesInvoices(salesInvoiceData, rawData, router));
          break;
        }
        case 'paid': {
          setMoreTableData(memoizedFilterSalesInvoices(salesInvoiceData, rawData, router, true));
          break;
        }
        case 'unpaid/paid': {
          setMoreTableData(memoizedFilterSalesInvoices(salesInvoiceData, rawData, router, true, true));
          break;
        }
        default: {
          break;
        }
      }
    }, [rawData.categoryOption, memoizedFilterSalesInvoices, salesInvoiceData, rawData, router]);
    
    useEffect(() => {
        setRawData((prevData : any) => {
          const updatedData = {...prevData, selectedDocument: salesInvoiceData.find((item: SalesInvoiceData) => prevData.salesInvoiceNumber === item.id)};
          setSelectedDocumentTableData([salesRecord(updatedData.selectedDocument, router)]);
          
          return updatedData;
        });


      }, [rawData.salesInvoiceNumber]);

    

      useEffect(() => {
        setSelectedDocumentTableData([]);
        setMoreTableData([]);
        const fetchBalanceAndSetState = async () => {
            const bal = await fetchBalance(rawData.companyId);
            setTotalBalance(bal);
        };
        fetchBalanceAndSetState();
    }, [rawData.companyId]);


    const headerTitles = ["id", "SI/DR No.", "Client's Name", "Date Issued", "Due Date", "Amount Due", "Amount Paid", "Balance", "Status", "Action"]

    
    
 
  return (
    <div className='tw-h-screen tw-w-full'>
        <div className='tw-m-4'>
                    <Button onClick={() => {router.push('/sales/')}} color='blue' >Home</Button>
        </div>
      <div className='tw-w-screen tw-flex tw-justify-center'>
        <div className='tw-w-[90%]  tw-flex tw-justify-center tw-bg-sky-600 tw-bg-opacity-30 tw-mt-4 tw-py-8'>
            <div className='tw-w-[90%] tw-rounded-tl-lg tw-rounded-tr-lg'>
                <Form>
                <Form.Field>
                    <h1 className='tw-font-bold tw-text-2xl'>Collection Info</h1>
                </Form.Field>
               <Form.Group>
                <Form.Field>
                        <label htmlFor="salesInvoiceNumber">SI#</label>
                        <Dropdown
                                id = 'salesInvoiceNumber'
                                placeholder='-- Sales Invoice Number -- '
                                search
                                selection
                                value = {rawData.salesInvoiceNumber}
                                options={salesInvoiceNumberOptions}
                                onChange={(e, item) => {handleFilteredOptionsChange(e, item, rawData, setRawData)}}
                            />
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="salesInvoiceNumber">Clients Name</label>
                        <Dropdown
                                id = 'companyId'
                                placeholder='--Company Name--'
                                search
                                value={rawData.companyId}
                                selection
                                options={clientsOption}
                                onChange={(e, item) => {handleOptionsChange(e, item, rawData, setRawData)}}
                            />
                    </Form.Field>
               </Form.Group>
                    <Form.Field >
                        <div className='tw-flex tw-gap-4 tw-items-center'>
                            <h1 className='tw-text-lg tw-font-bold'>Current Balance:</h1>
                            <p className='tw-text-green-600 tw-text-lg tw-font-bold'>₱ {formatCurrency(totalBalance.toString())}</p>
                        </div>
                    </Form.Field>
                    <Form.Field className='tw-float-right'>
                        <Dropdown
                                id = 'categoryOption'
                                search
                                selection
                                options={categoryOption}
                                value = {rawData.categoryOption}
                                onChange={(e, item) => {handleOptionsChange(e, item, rawData, setRawData)}}
                            />
                    </Form.Field>
                </Form>
            </div>
        </div>
      </div>
      <div className='tw-w-screen tw-flex tw-flex-col tw-items-center'>
      <div className='tw-py-4 tw-w-[90%]'>
            <Header>Selected : </Header>
          </div>
          <div className='tw-w-[90%]'>
            <Itable data={selectedDocumentTableData} headerTitles={headerTitles} allowDelete={false} />
          </div>
      </div>
      <div className='tw-w-screen tw-flex tw-flex-col tw-items-center'>
          <div className='tw-py-4 tw-w-[90%]'>
            <Header>More {rawData.categoryOption}</Header>
          </div>
          <div className='tw-w-[90%]'>
            <Itable data={moreTableData} headerTitles={headerTitles} allowDelete={false} />
          </div>
      </div>
        <div className='tw-w-full tw-flex tw-justify-center tw-pt-4'>
          <div className='tw-w-[90%]'>
            
          </div>
        </div>
    </div>
  )
}
