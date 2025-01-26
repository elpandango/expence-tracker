import {it, describe, expect, vi} from 'vitest';
import jwt from 'jsonwebtoken';
import {verifyToken} from "~/server/utils/auth";

const SECRET_KEY = 'somesupersecretsecret';

describe('verifyToken()', () => {
  const validPayload = { id: 1, username: 'testuser' };
  const validToken = jwt.sign(validPayload, SECRET_KEY, { expiresIn: '1h' });

  it('should return payload for a valid token', () => {
    const result = verifyToken(validToken);
    expect(result).toMatchObject(validPayload);
  });

  it('should return null for an invalid token', () => {
    const result = verifyToken('invalidToken');
    expect(result).toBeNull();
  });

  it('should return null for a token signed with a different secret', () => {
    const invalidToken = 'anothersecret';
    const result = verifyToken(invalidToken);
    expect(result).toBeNull();
  });

  it('should return null for an expired token', () => {
    const expiredToken = jwt.sign(validPayload, SECRET_KEY, { expiresIn: '-1s' });
    const result = verifyToken(expiredToken);
    expect(result).toBeNull();
  });

  it('should log an error for invalid tokens', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    verifyToken('invalidToken');
    expect(consoleSpy).toHaveBeenCalled;
    const [message, error] = consoleSpy.mock.calls[0];
    expect(message).toContain('Invalid token');
    expect(error).toBeInstanceOf(Error);
  });

  it('should return null for empty or incorrect input', () => {
    expect(verifyToken('')).toBeNull();
    expect(verifyToken(null as any)).toBeNull();
    expect(verifyToken(undefined as any)).toBeNull();
  });
});