import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createCommentDto: CreateCommentDto) {
    const { message, ratingId, commentId, userId } = createCommentDto;

    return this.prisma.comment.create({
      data: {
        message,
        ratingId,
        commentId,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.comment.findMany({
      include: {
        rating: true,  
        User: true, 
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        rating: true,
        User: true,
      },
    });
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const { message, ratingId, commentId, userId } = updateCommentDto;

    return this.prisma.comment.update({
      where: { id },
      data: {
        message,
        ratingId,
        commentId,
        userId,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
