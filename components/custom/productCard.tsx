// components/ProductCard.tsx
type Product = {
    name: string;
    description: string;
    price: number;
};

type ProductCardProps = {
    product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
        </div>
    );
};

export default ProductCard;
