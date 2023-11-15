import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../user/entities/user.entity';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { DepositDto } from './dto/create-deposit.dto';
import { BuyProductDto } from './dto/buy-product.dto';
import { BuyProductResponse } from './types/product.types';
import { GetAllUsersQueryParams } from 'src/user/dto/get-all-users-query-params.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private userService: UserService,
  ) {}

  private verifySellerPermission(product: Product, seller: User): void {
    if (product.seller.id !== seller.id) {
      throw new ForbiddenException(
        "You don't have the permission to perform this action",
      );
    }
  }

  private calculateChange(amount: number): number[] {
    const coins = [100, 50, 20, 10, 5];
    const change = [];

    for (const coin of coins) {
      const count = Math.floor(amount / coin);
      if (count > 0) {
        change.push(...Array(count).fill(coin));
        amount -= count * coin;
      }
    }

    return change;
  }

  private async getProductByIdWithSeller(id: number): Promise<Product> {
    return this.productRepository.findOne({
      relations: ['seller'],
      where: { id },
    });
  }

  createProduct(
    seller: User,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    const productPayload = {
      ...createProductDto,
      seller: seller,
    };

    return this.productRepository.save(productPayload);
  }

  getAllProducts(queryParams: GetAllUsersQueryParams): Promise<Product[]> {
    const { offset = 0, limit = 10 } = queryParams;

    const findOptions: FindManyOptions<Product> = {
      skip: offset,
      take: limit,
      order: { ['createdAt']: 'DESC' },
      relations: ['seller'],
    };

    return this.productRepository.find(findOptions);
  }

  getProductById(id: number): Promise<Product> {
    return this.productRepository.findOne({
      relations: ['seller'],
      where: { id },
    });
  }

  async updateProduct(
    seller: User,
    id: number,
    updatedProduct: UpdateProductDto,
  ): Promise<Product> {
    const existingProduct = await this.getProductByIdWithSeller(id);

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.verifySellerPermission(existingProduct, seller);

    Object.assign(existingProduct, updatedProduct);
    return this.productRepository.save(existingProduct);
  }

  async deleteProduct(seller: User, id: number): Promise<void> {
    const existingProduct = await this.getProductByIdWithSeller(id);

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.verifySellerPermission(existingProduct, seller);

    await this.productRepository.remove(existingProduct);
  }

  async deposit(user: User, depositDto: DepositDto): Promise<User> {
    const { amount } = depositDto;

    if (user.role !== 'buyer') {
      throw new BadRequestException(
        'Sorry only users with a "buyer" role can make deposits.',
      );
    }

    if (amount <= 0) {
      throw new BadRequestException(
        'Invalid amount. Please specify a positive number.',
      );
    }

    if (![5, 10, 20, 50, 100].includes(amount)) {
      throw new BadRequestException(
        'Invalid coin denomination. These are the accepted denominations: 5, 10, 20, 50, 100',
      );
    }

    const userDetail = await this.userService.findByUsername(user.username);

    return this.userService.updateUser(user.id, {
      deposit: userDetail.deposit + amount,
    });
  }

  async buyProduct(
    user: User,
    buyProductDto: BuyProductDto,
  ): Promise<BuyProductResponse> {
    const { productId, amountOfProducts } = buyProductDto;

    const userDetail = await this.userService.findByUsername(user.username);

    if (user.role !== 'buyer') {
      throw new BadRequestException(
        'Sorry only users with a "buyer" role can make purchases.',
      );
    }

    const product = await this.getProductById(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (amountOfProducts <= 0) {
      throw new BadRequestException(
        'Invalid amount. Please specify a positive number.',
      );
    }

    if (product.amountAvailable < amountOfProducts) {
      throw new BadRequestException(
        'Not enough stock available for the specified amount.',
      );
    }

    // Get the total cost of the product
    const totalCost = Number(product.cost) * amountOfProducts;

    if (userDetail.deposit < totalCost) {
      throw new BadRequestException(
        'Insufficient funds to complete the purchase.',
      );
    }

    // Update the product's amountAvailable
    await this.updateProductAmount(productId, {
      amountAvailable: product.amountAvailable - amountOfProducts,
    });

    // Update user's deposit after the purchase
    await this.userService.updateUser(user.id, {
      deposit: userDetail.deposit - totalCost,
    });

    // Calculate change
    const change = this.calculateChange(userDetail.deposit - totalCost);

    return {
      totalSpent: totalCost,
      purchasedProduct: product,
      change: change,
    };
  }

  async resetDeposit(user: User) {
    if (user.role !== 'buyer') {
      throw new BadRequestException(
        'Sorry only users with a "buyer" role can reset their deposit.',
      );
    }

    return this.userService.updateUser(user.id, { deposit: 0 });
  }

  async updateProductAmount(
    productId: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { amountAvailable } = updateProductDto;

    return this.productRepository.save({ id: productId, amountAvailable });
  }
}
