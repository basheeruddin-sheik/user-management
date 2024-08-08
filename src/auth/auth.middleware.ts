import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from "jsonwebtoken";
import * as moment from "moment";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    if (req.get("authorization")) {
      const tokenSplit = req.get("authorization").split(" ");
      const tokenType = tokenSplit[0];
      const authToken = tokenSplit[1];
      if (authToken) {
        let decodedToken;
        try {
          decodedToken = jwt.decode(authToken);
        } catch (e) {
          console.log("Token Error =>", e)
          throw new HttpException("Error verifying Authorization Token", HttpStatus.FORBIDDEN);
        }
        if (decodedToken) {
          req.headers.decodedToken = decodedToken;
          req.headers.metainfo = {
            id: decodedToken.id,
            createdAt: moment().unix(),
            updatedAt: moment().unix()
          };
          return next();
        } else {
          throw new HttpException("Token Validation Failed", HttpStatus.FORBIDDEN);
        }
      } else {
        throw new HttpException("Authorization Token Required", HttpStatus.FORBIDDEN);
      }
    } else {
      throw new HttpException("Authorization Token Required", HttpStatus.FORBIDDEN);
    }
  }
}
