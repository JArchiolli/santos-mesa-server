import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, StreamableFile } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';

@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) { }

  @Post()
  @UseInterceptors(FileInterceptor('url_img'))
  async create(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.restaurantService.create(createRestaurantDto, file);
  }

  @Get()
  findAll() {
    return this.restaurantService.findAll();
  }

  @Get('photo')
  async findphoto() {

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName) throw Error('Azure Storage accountName not found');
    const BlobService = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );

    const containerClient = BlobService.getContainerClient("santosmesacontainer");
    try {
      await containerClient.createIfNotExists();
    } catch (error) {
      throw new Error("Erro ao verificar/criar o container.");
    }

    const blobName = "photodac78bd0-09b0-11f0-9369-892bb6c201f7.png";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const uploadBlobResponse = await blockBlobClient.downloadToBuffer();


    return new StreamableFile(uploadBlobResponse)

  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto) {
    return this.restaurantService.update(+id, updateRestaurantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantService.remove(+id);
  }
}
