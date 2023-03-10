import React, { SVGProps, useEffect } from 'react';
import { useSession, signOut, getSession } from 'next-auth/react';
import { Button, Checkbox, Dropdown, Grid, Header, Input, Label, Search } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Inav from 'components/Inav';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import ICard from 'components/ICard';
import IFooter from 'components/IFooter';
import ISideCard from 'components/ISideCard';
import ISidePanel from 'components/ISidePanel';
import Itable from 'components/IFlexTable';

const Chart = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
        <path d="M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48h-32c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48v160c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48v288c0 26.5-21.5 48-48 48h-32c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z" />
    </svg>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    const res = await axios.get(`http://localhost:3000/api/${session?.user?.email}`);

    return {
        props: { post: res.data.data },
    };
};

const sample = [
    {
        id: 1,
        pullOutNumber: '89901',
        dateIssued: '2023-03-08',
        salesInvoiceNumber: "8921",
        view: <Button color="blue">Breakdown</Button>,
    },
];

const options = [
    { key: 'salesInvoice', text: 'Sales Invoice', value: 'salesInvoice' },
    { key: 'client', text: "Client's Name", value: 'client' },
];

const headerTitles = ['id', 'Pull out No.', 'Date Issued', 'SI Number', 'Actions'];

export default function home({ post }: any) {
    const router = useRouter();
    const { data } = useSession();

    //   useEffect(() => {
    //     if(!data){
    //       alert("Invalid Access")
    //       router.push('/')
    //     }
    //   }, [])

    useEffect(() => {
        if (post.employeeInfoId === null) {
            router.push('/newUser');
        }
    }, []);

    return (
        data && (
            <>
                <div className="tw-w-full tw-h-full">
                    <Inav firstName={post.employeeInfoId !== null ? post.employeeInfo.firstName : ''} />
                    <div className="tw-w-full tw-flex tw-items-center tw-flex-col tw-pb-96">
                        <div className="tw-w-[95%] tw-p-4 tw-flex tw-justify-between tw-h-full tw-items-center">
                            <h1 className="tw-text-2xl tw-ml-2 tw-font-bold">Pull Out</h1>
                        </div>
                        <div className="tw-w-[95%] tw-p-4 tw-h-full">
                            <Itable data={sample} headerTitles={headerTitles} allowDelete={false} editing={false} />
                        </div>
                    </div>
                </div>
                <IFooter />
            </>
        )
    );
}
