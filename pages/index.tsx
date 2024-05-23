import { Box, Button, FileUploader, Flex, Form, FormGroup, FormProps, H1, H4, Input, InputProps, Panel, Textarea } from '@bigcommerce/big-design';
import styled from 'styled-components';
import ErrorMessage from '../components/error';
import { useProducts } from '../lib/hooks';
import { InsertDriveFileIcon } from '@bigcommerce/big-design-icons';
import { useSession } from 'context/session';
import { useEffect, useState } from 'react';

type storeDatas = {
    id: number;
    store_id: number;
    heading: string;
    sub_heading: string;
    csv_url: string;
    storeUrl: string;
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


    const handleSubmit: FormProps['onSubmit'] = (event) => {
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            console.log("form", form)
        }
    };

    // const handleSubmit = async (data: storeDatas) => {
    //     // Update product details
    //     await fetch(`/api/related-products/${data.id}?context=${encodedContext}`, {
    //         method: 'PUT',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(data),
    //     });
    //     router.push('/products');
    // }

    const [files, setFiles] = useState<File[]>([]);

    const validateFileSize = (file: File): boolean => {
        const MB = 3 * 1024 * 1024;
        return file.size <= MB;
    };

    const { context: encodedContext } = useSession() || {};

    useEffect(() => {
        const fetchStoreData = async () => {
            if (!encodedContext) {
                console.error('Context is not available.');
                return;
            }
            try {
                const response = await fetch(`/api/related-products/products?context=${encodedContext}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Fetched store data:", data);
                if (data) {
                    setStoreData(data);
                }
            } catch (error) {
                console.error('Error fetching store data:', error);
            }
        };

        fetchStoreData();
    }, [encodedContext]);

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
                <FormGroup>
                    <Input
                        iconLeft={<InsertDriveFileIcon color="success" />}
                        label="CSV File URL"
                        onChange={handleChange}
                        placeholder="https://"
                        type="text"
                        name="csv_url"
                        value={storeData.csv_url}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Input
                        label="Related Product Heading"
                        onChange={handleChange}
                        placeholder="Heading"
                        type="text"
                        name="heading"
                        value={storeData.heading}
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
                        value={storeData.sub_heading}
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

export default Index;
