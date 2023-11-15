import { Product } from '../entities/product.entity';

export interface BuyProductResponse {
  totalSpent: number;
  purchasedProduct: Product;
  change: number[];
}
