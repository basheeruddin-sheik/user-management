import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { BlockController } from './block/block.controller';
import { BlockService } from './block/block.service';
import { MongoService } from './database/mongo.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthMiddleware } from './auth/auth.middleware';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true, // Make the cache available globally
      max: +process.env.CACHE_MAX_ITEMS || 1000, // maximum number of items in cache
    }),
  ],
  controllers: [
    AppController, 
    UserController, 
    BlockController, 
    AuthController],
  providers: [
    AppService, 
    UserService, 
    BlockService, 
    MongoService, 
    AuthService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(AuthMiddleware)
        .exclude(
          {path: "users/create", method: RequestMethod.POST},
        )
        .forRoutes(
            UserController,
            BlockController
        );
}
}
