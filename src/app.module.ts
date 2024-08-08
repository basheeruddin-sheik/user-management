import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { BlockController } from './block/block.controller';
import { BlockService } from './block/block.service';
import { MongoService } from './app-commons/mongo.service';

@Module({
  imports: [],
  controllers: [AppController, UserController, BlockController],
  providers: [AppService, UserService, BlockService, MongoService],
})
export class AppModule {}
