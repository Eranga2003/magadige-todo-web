import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'magadige_jwt_secret_key_2026_orange_theme';

/**
 * Generates a JWT token for a user
 * @param payload Object containing the user ID
 * @returns signed JWT token
 */
export function generateToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verifies a JWT token
 * @param token JWT token string
 * @returns decoded payload or null if invalid
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}
