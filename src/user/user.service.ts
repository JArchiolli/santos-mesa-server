import { Injectable } from '@nestjs/common';
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
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async create(createUserDto: CreateUserDto,
    file: Express.Multer.File) {
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

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role ?? 'user',
        profilePicture: blobUrl,
        userName: createUserDto.userName
      },
      select: { id: true, email: true, role: true, profilePicture: true, userName: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email } });
  }
}
