import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { v1 } from 'uuid';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) { }

  async create(createRestaurantDto: CreateRestaurantDto, file) {

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName) throw Error('Azure Storage accountName not found');
    const BlobService = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );

    const containerClient = BlobService.getContainerClient("santosmesacontainer");
    containerClient.setAccessPolicy('blob');
    try {
      await containerClient.createIfNotExists();
    } catch (error) {
      throw new Error("Erro ao verificar/criar o container.");
    }

    const blobName = 'photo' + v1() + '.png';
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const uploadBlobResponse = await blockBlobClient.upload(file.buffer, file.size);

    console.log('Upload Status:', uploadBlobResponse._response.status);

    const blobUrl = `https://${accountName}.blob.core.windows.net/santosmesacontainer/${blobName}`;

    return this.prisma.restaurant.create({
      data: {
        name: createRestaurantDto.name,
        aboutUs: createRestaurantDto.aboutUs,
        url_img: blobUrl,
        category: {
          connect: {
            id: Number(createRestaurantDto.categoryId)
          },
        },
        location: {
          connect: {
            id: Number(createRestaurantDto.locationId)
          },
        },
        rating: createRestaurantDto.rating
      },
      select: {
        id: true,
        location: true,
        url_img: true,
        aboutUs: true,
        name: true,
        category: true,
        rating: true
      }
    })
  }

  findAll() {
    return this.prisma.restaurant.findMany({
      include: {
        category: true,
        location: true,
        rating: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.restaurant.findFirst({
      where: { id },
      include: {
        category: true,
        location: true,
        rating: true,
      }
    })
  }

  update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
    return this.prisma.restaurant.update({
      where: { id },
      data: {
        name: updateRestaurantDto.name,
        url_img: updateRestaurantDto.url_img,
        aboutUs: updateRestaurantDto.aboutUs,
        category: {
          connect: {
            id: updateRestaurantDto.categoryId
          },
        },
        location: {
          connect: {
            id: updateRestaurantDto.locationId
          },
        },
        rating: updateRestaurantDto.rating,
      },
    });
  }

  remove(id: number) {
    return this.prisma.restaurant.delete({ where: { id } })
  }
}
