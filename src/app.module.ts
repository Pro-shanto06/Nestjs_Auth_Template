import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import * as dotenv from 'dotenv';
import { MailModule } from './modules/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './configuration/app.config';
import { AppController } from './app.controller';

dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(appConfig.mongodbURL),
    AuthModule,
    UserModule,
    MailModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
