import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { CategoryModule } from './category/category.module';
import { LocationModule } from './location/location.module';
import { JwtModule } from '@nestjs/jwt';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    JwtModule,
    RestaurantModule,
    CategoryModule,
    LocationModule, 
    CategoryModule,
    RatingModule
  ],
})
export class AppModule { }
