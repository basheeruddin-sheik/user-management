import { Injectable } from '@nestjs/common';
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {

    async generateToken(body: any) {
        return await jwt.sign({
            ...body
        }, process.env.JWT_SECRET, { 
            expiresIn: 86400  // Expires in 24 hours
        }); 
    }
}
