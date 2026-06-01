import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtUserPayload = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export const signAuthToken = (payload: JwtUserPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

export const verifyAuthToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
