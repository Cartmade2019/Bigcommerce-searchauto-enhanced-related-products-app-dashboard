import { Box, Button, FileUploader, Flex, Form, FormGroup, FormProps, H1, H4, InlineMessage, Input, InputProps, Panel, Textarea } from '@bigcommerce/big-design';
import styled from 'styled-components';
import ErrorMessage from '../components/error';
import { useProducts, useStoreData } from '../lib/hooks';
import { EditIcon, InsertDriveFileIcon } from '@bigcommerce/big-design-icons';
import { useSession } from 'context/session';
import { FormEvent, useEffect, useState } from 'react';
import router from 'next/router';

type storeDatas = {
    id: number;
    store_id?: number;
    heading: string;
    sub_heading: string;
    csv_url: string;
    storeUrl?: string;
};


const Index = () => {
    // if (isLoading) return <Loading />;
    const [storeData, setStoreData] = useState<storeDatas>();
    const [value, setValue] = useState('');
    const [textAreaValue, setTextAreaValue] = useState('');

    // const handleChange: InputProps['onChange'] = (event) =>
    //     setValue(event.target.value);

    // const handleTaxtAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
    //     setTextAreaValue(event.target.value);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newStoreData = {
            ...storeData,
            [name]: value,
        };
        setStoreData(newStoreData);
    };

    const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        const newStoreData = {
            ...storeData,
            [name]: value,
        };
        setStoreData(newStoreData);
    };

    const dataGlobal = {
        id: storeData ? storeData.id : '',
        csv_url: storeData ? storeData.csv_url : '',
        heading: storeData ? storeData.heading : '',
        sub_heading: storeData ? storeData.sub_heading : '',
    };


    // const handleSubmit: FormProps['onSubmit'] = async (event: FormEvent<HTMLFormElement>) => {
    //     event.preventDefault();
    //     event.stopPropagation();

    //     const form = event.currentTarget;
    //     if (form.checkValidity()) {
    //         await fetch(`/api/related-products/${dataGlobal.id}?context=${encodedContext}`, {
    //             method: 'PUT',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify(dataGlobal),
    //         });
    //         router.push('/products');
    //     } else {
    //         console.log("form", form);
    //     }
    // };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const data: storeDatas = {
            id: Number(formData.get('id')),
            heading: formData.get('heading') as string,
            sub_heading: formData.get('sub_heading') as string,
            csv_url: formData.get('csv_url') as string,
        };

        await someAsyncOperation(data);
    };

    const someAsyncOperation = async (data: storeDatas) => {
        console.log("rttrtr", data)
        try {
            const { csv_url, heading, sub_heading } = data;
            const apiFormattedData = { csv_url: csv_url, heading: heading, sub_heading: sub_heading };
            // Update product details
            await fetch(`/api/related-products/${dataGlobal.id}?context=${encodedContext}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiFormattedData),
            });

            router.push('/');
        } catch (error) {
            console.error('Error updating the product: ', error);
        }
    };
    const [files, setFiles] = useState<File[]>([]);

    const validateFileSize = (file: File): boolean => {
        const MB = 3 * 1024 * 1024;
        return file.size <= MB;
    };

    const { context: encodedContext } = useSession() || {};

    // useEffect(() => {
    //     console.log("adsdas", encodedContext)
    //     const fetchStoreData = async () => {
    //         if (!encodedContext) {
    //             console.error('Context is not available.');
    //             return;
    //         }
    //         try {
    //             const response = await fetch(`/api/related-products/products?context=${encodedContext}`);

    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! Status: ${response.status}`);
    //             }

    //             const data = await response.json();
    //             console.log("Fetched store data:", data);
    //             if (data) {
    //                 setStoreData(data);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching store data:', error);
    //         }
    //     };

    //     fetchStoreData();
    // }, [encodedContext]);

    // Assuming useStoreData is a custom hook that returns an object with isLoading and storeDataResult properties
    const { isLoading: isInfoLoading, storeDataResult } = useStoreData();
    const { id, csv_url, heading, sub_heading } = storeDataResult ?? {} as storeDatas;
    const formData = { id, csv_url, heading, sub_heading }
    console.log("dasdasd", formData)
    return (
        <Panel header="Homepage" id="home">
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <FileUploader
                        dropzoneConfig={{
                            label: 'Drag and drop image here',
                        }}
                        accept={'.xlsx'}
                        files={files}
                        label="Upload files"
                        onFilesChange={setFiles}
                        required
                        validators={[
                            {
                                validator: validateFileSize,
                                type: 'file-size',
                                message: "File size should not exceed 3 MB"
                            },
                        ]}
                    />
                </FormGroup>
                {/* 
                <FormGroup>
                    <Input
                        iconLeft={<InsertDriveFileIcon color="success" />}
                        label="CSV File URL"
                        onChange={handleChange}
                        placeholder="https://"
                        type="text"
                        name="csv_url"
                        disabled
                        value={storeData ? storeData.csv_url : ''}
                        required
                    />
                </FormGroup>
                */}

                <input
                    type="hidden"
                    name="csv_url"
                    value={csv_url}
                    required
                />
                {csv_url && (
                    <FormGroup>
                        <div style={csvBoxStyle}>
                            <a style={urlStyle} target='_blank' href={csv_url || ''}>
                                <h4 style={{ color: "#313440" }}>CSV File</h4>
                                <span className='span-url' style={{ color: "#17ab17" }}>File Uploaded: Click here to download.</span>
                            </a>
                        </div>
                    </FormGroup>
                )}

                <FormGroup>
                    <Input
                        iconLeft={<EditIcon color="#a5aff7" />}
                        label="Related Product Heading"
                        onChange={handleChange}
                        placeholder="Heading"
                        type="text"
                        name="heading"
                        value={heading}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Textarea
                        label="Sub Heading"
                        onChange={handleTextareaChange}
                        rows={3}
                        placeholder="sub Heading"
                        name="sub_heading"
                        value={sub_heading}
                        required
                    />
                </FormGroup>
                <Box marginTop="xxLarge">
                    <Button type="submit">Save</Button>
                </Box>
            </Form>
        </Panel>
    );
};

const StyledBox = styled(Box)`
    min-width: 10rem;
`;

const csvBoxStyle = {
    border: "1px solid #dadbe8",
    padding: "20px",
    paddingTop: "0",
    maxWidth: "376px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    borderRadius: "4px"
};

const urlStyle = {
    textDecoration: "none",
};


export default Index;
