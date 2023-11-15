import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AuthUser } from '../auth/decorators/auth.decorator';
import { User } from '../user/entities/user.entity';
import { DepositDto } from './dto/create-deposit.dto';
import { BuyProductDto } from './dto/buy-product.dto';
import { GetAllUsersQueryParams } from '../user/dto/get-all-users-query-params.dto';
import { ProductDto } from './dto/product.dto';

@ApiTags('product')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOkResponse({
    description: 'Create Product',
    type: ProductDto,
  })
  @Post()
  createProduct(
    @AuthUser() user: User,
    @Body() createProductDto: CreateProductDto,
  ) {
    if (user.role === 'buyer')
      throw new BadRequestException(
        'Sorry you do not have the permission to create a Product',
      );
    return this.productService.createProduct(user, createProductDto);
  }

  @ApiOkResponse({
    description: 'Get all products',
    type: [ProductDto],
  })
  @Get('products')
  getAllProducts(@Query() queryParams: GetAllUsersQueryParams) {
    return this.productService.getAllProducts(queryParams);
  }

  @ApiOkResponse({
    description: 'Get by Id',
    type: ProductDto,
  })
  @Get(':id')
  getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductById(id);
  }

  @ApiOkResponse({
    description: 'Update a product',
  })
  @Patch(':id')
  updateProduct(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    if (user.role === 'buyer')
      throw new BadRequestException(
        'Sorry you do not have the permission to edit this Product',
      );
    return this.productService.updateProduct(user, id, updateProductDto);
  }

  @ApiOkResponse({
    description: 'Delete a product',
  })
  @Delete(':id')
  deleteProduct(@AuthUser() user: User, @Param('id', ParseIntPipe) id: number) {
    if (user.role === 'buyer')
      throw new BadRequestException(
        'Sorry you do not have the permission to delete this Product',
      );
    return this.productService.deleteProduct(user, id);
  }

  @ApiOkResponse({
    description: 'Deposit coin',
  })
  @Post('deposit')
  async deposit(@Body() depositDto: DepositDto, @AuthUser() user: User) {
    return this.productService.deposit(user, depositDto);
  }

  @ApiOkResponse({
    description: 'Buy product',
  })
  @Post('buy')
  async buyProduct(
    @AuthUser() user: User,
    @Body() buyProductDto: BuyProductDto,
  ) {
    return this.productService.buyProduct(user, buyProductDto);
  }

  @ApiOkResponse({
    description: 'Reset coin',
  })
  @Post('reset')
  async resetDeposit(@AuthUser() user: User) {
    return this.productService.resetDeposit(user);
  }
}
