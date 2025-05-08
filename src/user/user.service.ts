import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DefaultAzureCredential } from '@azure/identity';
import { v1 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        profilePicture: true,
        userName: true,
        exibitionName: true,
        favorites: true,
        badges:true
      }
    });
    return user;
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.rating.deleteMany({ where: { userId: id } });
      return prisma.user.delete({ where: { id } });
    });
  }
  async update(id: number, updateUserDto: UpdateUserDto, file?: Express.Multer.File) {
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id }
        }
      })

      if (existingUser) {
        throw new ConflictException("Email já cadastrado!")
      }
    }


    let blobUrl: string | undefined;

    if (file) {
      const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      if (!accountName) throw Error('Azure Storage accountName not found');

      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (!connectionString) throw Error('Azure Storage connection string not found');
      const BlobService = BlobServiceClient.fromConnectionString(connectionString);

      const containerClient = BlobService.getContainerClient("santosmesacontainer2");
     // containerClient.setAccessPolicy('blob');

      try {
        await containerClient.createIfNotExists();
      } catch (error) {
        throw new Error("Erro ao verificar/criar o container.");
      }

      const blobName = 'photo' + v1() + '.png';
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(file.buffer, file.size);
      blobUrl = `https://${accountName}.blob.core.windows.net/santosmesacontainer2/${blobName}`;
    }

    const data: any = {
      email: updateUserDto.email,
      role: updateUserDto.role,
      userName: updateUserDto.userName,
      exibitionName: updateUserDto.exibitionName
    };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (blobUrl) {
      data.profilePicture = blobUrl;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        profilePicture: true,
        userName: true,
        exibitionName: true
      },
    });
  }

  async create(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Este email já está em uso');
    }


    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (!accountName) throw Error('Azure Storage accountName not found');

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) throw Error('Azure Storage connection string not found');

    const BlobService = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = BlobService.getContainerClient("santosmesacontainer2");
    // containerClient.setAccessPolicy('blob');

    try {
      await containerClient.createIfNotExists();
    } catch (error) {
      throw new Error("Erro ao verificar/criar o container.");
    }

    let blobUrl: string | undefined;

    if (file) {
      const blobName = 'photo' + v1() + '.png';
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const uploadBlobResponse = await blockBlobClient.upload(file.buffer, file.size);
      console.log('Upload Status:', uploadBlobResponse._response.status);

      blobUrl = `https://${accountName}.blob.core.windows.net/santosmesacontainer2/${blobName}`;
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role ?? 'user',
        profilePicture: blobUrl,
        userName: createUserDto.userName,
        exibitionName: createUserDto.exibitionName
      },
      select: {
        id: true,
        email: true,
        role: true,
        profilePicture: true,
        userName: true,
        exibitionName: true
      },
    });
  }
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email } });
  }


}
