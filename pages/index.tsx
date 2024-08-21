import { AlertProps, Box, Button, FileUploader, Form, FormGroup, Input, Link, Panel, Textarea } from '@bigcommerce/big-design';
import styled from 'styled-components';
import { useStoreData } from '../lib/hooks';
import { EditIcon } from '@bigcommerce/big-design-icons';
import { useSession } from 'context/session';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { alertsManager } from './_app';

type storeDatas = {
    id: number;
    store_id?: number;
    heading: string;
    sub_heading: string;
    csv_url: string;
    storeUrl?: string;
};
const alertSuccess: AlertProps = {
    messages: [
        {
            text: 'Changes Applied.',

        },
    ],
    type: 'success',
    onClose: () => null,
};
const alertFailure: AlertProps = {
    messages: [
        {
            text: 'something went woring, please try again.',

        },
    ],
    type: 'error',
    onClose: () => null,
};

const someAsyncOperation = async (data: storeDatas, encodedContext: any) => {
    try {
        const { id, csv_url, heading, sub_heading } = data;
        const apiFormattedData = { csv_url: csv_url, heading: heading, sub_heading: sub_heading };
        // Update product details
        const response = await fetch(`/api/related-products/${id}?context=${encodedContext}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiFormattedData),
        });

        // router.push('/');
        return response;
    } catch (error) {
        console.error('Error updating the product: ', error);
        return error;
    }
};

const validateFileSize = (file: File): boolean => {
    const MB = 3 * 1024 * 1024;
    return file.size <= MB;
};

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

const Index = () => {
    // if (isLoading) return <Loading />;
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Assuming useStoreData is a custom hook that returns an object with isLoading and storeDataResult properties
    const { context: encodedContext } = useSession() || {};
    const { isLoading: isInfoLoading, storeDataResult } = useStoreData();
    const { id, store_id, csv_url, heading: initialHeading = '', sub_heading: initialSubHeading = '' } = storeDataResult ?? {} as storeDatas;
    const [formData, setFormData] = useState({
        heading: initialHeading,
        sub_heading: initialSubHeading
    });
    const [csvUrlData, setCsvUrlData] = useState(csv_url);

    // When form is submitter
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const submitFormData = new FormData(event.currentTarget);
        const file = files && files.length > 0 ? files[0] : null;

        const data: storeDatas = {
            id: Number(submitFormData.get('store_id')),
            heading: submitFormData.get('heading') as string,
            sub_heading: submitFormData.get('sub_heading') as string,
            csv_url: submitFormData.get('csv_url') as string,
        };

        setIsSubmitting(true);

        try {
            if (file) {
                const fileFormData = new FormData();
                fileFormData.append('file', file);

                const fileUploadResponse = await fetch('api/related-products/upload', {
                    method: 'POST',
                    body: fileFormData
                });

                if (!fileUploadResponse.ok) {
                    throw new Error('File upload failed');
                }

                const fileUploadResult = await fileUploadResponse.json();
                data.csv_url = fileUploadResult.fileUrl;
            }

            const operationSynced = await someAsyncOperation(data, encodedContext);
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (operationSynced.ok) {
                // Update formData state with the submitted data, including csv_url
                setFiles([]);
                setCsvUrlData(data.csv_url);
                console.log("data csv", data.csv_url)
                alertsManager.add(alertSuccess);
            } else {
                alertsManager.add(alertFailure);
            }
        } catch (error) {
            alertsManager.add(alertFailure);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Text change handle function
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Text area change handle function
    const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // set form data
    useEffect(() => {
        console.log("use effect triger")
        setCsvUrlData(csv_url);
        setFormData({
            heading: initialHeading,
            sub_heading: initialSubHeading
        });
    }, [initialHeading, initialSubHeading]);

    return (
        <Panel header="Homepage" id="home">
            <Form onSubmit={handleSubmit}>
                <input
                    type="hidden"
                    name="store_id"
                    value={store_id}
                />
                <input
                    type="hidden"
                    name="csv_url"
                    value={csvUrlData}
                />
                <FormGroup>
                    <FileUploader
                        dropzoneConfig={{
                            label: 'Drag and drop your excel file here',
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

                {csvUrlData && (
                    <FormGroup>
                        <div style={csvBoxStyle}>
                            {/* <a style={urlStyle} target='_blank' href={csvUrlData || ''}>
                                <h4 style={{ color: "#313440" }}>CSV File - {csvUrlData || 'Null'}</h4>
                                <span className='span-url' style={{ color: "#17ab17" }}>File Uploaded: Click here to download.</span>
                            </a> */}
                            <h4 style={{ color: "#313440" }}>CSV File</h4>
                            <Link external href={csvUrlData || ''} target="_blank">
                                <span className='span-url' style={{ color: "#17ab17" }}>File Uploaded: Click here to download.</span>
                            </Link>
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
                        value={formData.heading}
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
                        value={formData.sub_heading}
                        required
                    />
                </FormGroup>
                <Box marginTop="xxLarge">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </Box>
            </Form>
        </Panel>
    );
};


export default Index;
