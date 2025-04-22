/**
 * Generates user-friendly, unique codes for players
 * Format: XXXX (where X can be alphanumeric, excluding ambiguous characters)
 */

import { eq } from 'drizzle-orm';
import { db } from './server/db';
import { player } from './server/db/schema';

// Define character set (excluding ambiguous chars like 0/O, 1/I, etc.)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a random code in the format XXXX-XXXX
 */
export function generatePlayerCode(): string {
	return Array(4)
		.fill(0)
		.map(() => CHARS.charAt(Math.floor(Math.random() * CHARS.length)))
		.join('');
}

/**
 * Check if a code is valid according to this format
 */
export function isValidCode(code: string): boolean {
	const pattern = /^[A-HJ-NP-Z2-9]{4}$/;
	return pattern.test(code);
}

/**
 * Generate a unique code with up to 5 attempts
 */
export async function generateUniqueCode(): Promise<string | null> {
	let code: string | null = null;
	let attempts = 0;

	while (!code && attempts < 5) {
		attempts++;
		const candidateCode = generatePlayerCode();

		// Check if code already exists
		const existingPlayer = await db.query.player.findFirst({
			where: eq(player.code, candidateCode)
		});

		if (!existingPlayer) {
			code = candidateCode;
		}
	}

	return code;
}
