import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/config.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    AuthModule
  ],
})
export class AppModule {}
