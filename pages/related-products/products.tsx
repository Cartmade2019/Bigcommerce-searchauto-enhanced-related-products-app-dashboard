// pages/products.tsx
import ProductCard from '@components/custom/productCard';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Product = {
    sku: string;
    name: string;
    description: string;
    price: number;
};

const products: Product[] = [
    { sku: 'SKU1', name: 'Product 1', description: 'Description 1', price: 10 },
    { sku: 'SKU2', name: 'Product 2', description: 'Description 2', price: 20 },
    { sku: 'SKU3', name: 'Product 3', description: 'Description 3', price: 30 },
];

const ProductsPage: React.FC = () => {
    const router = useRouter();
    const { sku } = router.query;

    const [productsData, setProductsData] = useState([]);

    const fetchProductsData = async () => {
        try {
            const response = await fetch(`/api/related-products/products?sku=${sku}`);
            const data = await response.json();
            console.log("data", data)
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    useEffect(() => {

        fetchProductsData();
    }, []);

    // Find the product based on the SKU
    const product = products.find((product) => product.sku === sku);

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="products-page">
            <ProductCard product={product} />
        </div>
    );
};

export default ProductsPage;
