import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RefreshTokensModule } from './modules/refresh-tokens/refresh-tokens.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    DatabaseModule,

    // Feature modules
    UsersModule,
    RolesModule,
    PermissionsModule,
    RefreshTokensModule,
    AuthModule,
  ],
  providers: [Logger],
})
export class AppModule {}
