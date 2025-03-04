// src/auth/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import jwksRsa from 'jwks-rsa';
import { promisify } from 'util';
import { verify } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwksClient: jwksRsa.JwksClient;

  constructor(private readonly config: ConfigService) {
    this.jwksClient = jwksRsa({
      jwksUri: `https://cognito-idp.${this.config.get('AWS_REGION')}.amazonaws.com/${this.config.get('COGNITO_USER_POOL_ID')}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token was not provided.');
    }

    try {
      const decoded = await this.validateToken(token);
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException(this.handleError(error));
    }
  }

  private extractToken(req: Request): string | null {
    return req.headers.authorization?.split(' ')[1] || null;
  }

  private async validateToken(token: string): Promise<any> {
    const getKey = promisify(this.jwksClient.getSigningKey);

    // const decoded = await new Promise((resolve, reject) => {
    //   verify(
    //     token,
    //     (header, callback) => {
    //       getKey(header.kid)
    //         .then((key) => {
    //           callback(null, key.getPublicKey());
    //         })
    //         .catch((err) => callback(err));
    //     },
    //     {
    //       issuer: `https://cognito-idp.${this.config.get('AWS_REGION')}.amazonaws.com/${this.config.get('COGNITO_USER_POOL_ID')}`,
    //       algorithms: ['RS256'],
    //     },
    //     (err, decoded) => {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(decoded);
    //       }
    //     }
    //   );
    // });

    return true;

  }

  private handleError(error: any): string {
    if (error.name === 'TokenExpiredError') {
      return 'Expired token';
    }
    if (error.name === 'JsonWebTokenError') {
      return JSON.stringify(error);
    }
    return 'Error on authentication';
  }
}