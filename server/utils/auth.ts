import jwt from 'jsonwebtoken';

const SECRET_KEY = 'somesupersecretsecret';

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        console.error('Invalid token', error);
        return null;
    }
}