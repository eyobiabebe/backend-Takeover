// src/utils/generateToken.ts
import jwt, { SignOptions } from 'jsonwebtoken';

export interface JWTPayload {
  id: number;
  email: string;
}

export const generateToken = (payload: JWTPayload, expiresIn: string) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: expiresIn || '1h' } as SignOptions);
};