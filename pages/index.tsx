import { Box, Flex, Form, FormGroup, FormProps, H1, H4, Input, InputProps, Panel, Textarea } from '@bigcommerce/big-design';
import styled from 'styled-components';
import ErrorMessage from '../components/error';
import Loading from '../components/loading';
import { useProducts } from '../lib/hooks';
import { InsertDriveFileIcon } from '@bigcommerce/big-design-icons';
import { useSession } from 'context/session';
import { useState } from 'react';


const Index = () => {
    const encodedContext = useSession()?.context;
    const { error, isLoading, summary } = useProducts();

    // if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;
    const [value, setValue] = useState('');
    const [textAreaValue, setTextAreaValue] = useState('');

    const handleChange: InputProps['onChange'] = (event) =>
        setValue(event.target.value);

    const handleTaxtAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
        setTextAreaValue(event.target.value);

    const handleSubmit: FormProps['onSubmit'] = (event) => {
        const form = event.currentTarget;
    
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
      };

    return (
        <Panel header="Homepage" id="home">
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Input
                        iconLeft={<InsertDriveFileIcon color="success" />}
                        label="CSV File URL"
                        onChange={handleChange}
                        placeholder="https://"
                        type="text"
                        value={value}
                        required
                    />

                </FormGroup>
                <FormGroup>
                    <Input
                        label="Related Product Heading"
                        onChange={handleChange}
                        placeholder="Heading"
                        type="text"
                        value={value}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Textarea
                        label="Sub Heading"
                        onChange={handleTaxtAreaChange}
                        rows={3}
                        placeholder="sub Heading"
                        value={value}
                        required
                    />
                </FormGroup>
            </Form>
        </Panel>
    );
};

const StyledBox = styled(Box)`
    min-width: 10rem;
`;

export default Index;
