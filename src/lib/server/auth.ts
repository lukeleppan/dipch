import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ADMIN_PASSWORD, JWT_SECRET, JWT_EXPIRY, JWT_PLAYER_EXPIRY } from '$env/static/private';

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
	console.log('Password: ' + password);
	console.log('Password Hash: ' + ADMIN_PASSWORD);
	return await bcrypt.compare(password, ADMIN_PASSWORD);
}

export function createAdminJWT(): string {
	return jwt.sign({ isAdmin: true }, JWT_SECRET, {
		expiresIn: JWT_EXPIRY as jwt.SignOptions['expiresIn']
	});
}

export function verifyAdminJWT(token: string): AdminJWTPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as AdminJWTPayload;
	} catch {
		return null;
	}
}

export function createPlayerJWT(id: number): string {
	return jwt.sign({ id }, JWT_SECRET, {
		expiresIn: JWT_PLAYER_EXPIRY as jwt.SignOptions['expiresIn']
	});
}

export function verifyPlayerJWT(token: string): PlayerJWTPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as PlayerJWTPayload;
	} catch {
		return null;
	}
}
