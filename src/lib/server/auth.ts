import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '$env/dynamic/private';

export interface AdminJWTPayload {
	isAdmin: boolean;
	iat: number;
	exp: number;
}

export interface PlayerJWTPayload {
	id: number;
	iat: number;
	exp: number;
}

export async function verifyPassword(password: string): Promise<boolean> {
	return await bcrypt.compare(password, env.ADMIN_PASSWORD);
}

export function createAdminJWT(): string {
	return jwt.sign({ isAdmin: true }, env.JWT_SECRET, {
		expiresIn: env.JWT_EXPIRY as jwt.SignOptions['expiresIn']
	});
}

export function verifyAdminJWT(token: string): AdminJWTPayload | null {
	try {
		return jwt.verify(token, env.JWT_SECRET) as AdminJWTPayload;
	} catch {
		return null;
	}
}

export function createPlayerJWT(id: number): string {
	return jwt.sign({ id }, env.JWT_SECRET, {
		expiresIn: env.JWT_PLAYER_EXPIRY as jwt.SignOptions['expiresIn']
	});
}

export function verifyPlayerJWT(token: string): PlayerJWTPayload | null {
	try {
		return jwt.verify(token, env.JWT_SECRET) as PlayerJWTPayload;
	} catch {
		return null;
	}
}
