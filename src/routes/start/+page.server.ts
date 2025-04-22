import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { isValidCode } from '$lib/codes';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { player } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { createPlayerJWT } from '$lib/server/auth';

const schema = z.object({
	code: z.string()
});

export const load: PageServerLoad = async ({ request, cookies }) => {
	const playerToken = cookies.get('player_token');
	if (playerToken) {
		redirect(303, '/');
	}

	const form = await superValidate(request, zod(schema));
	return { form };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return message(form, { status: 400, text: 'invalid player code' });
		}

		await new Promise((resolve) => setTimeout(resolve, 300));

		const code = form.data.code;

		if (!isValidCode(code)) {
			return message(form, { status: 400, text: 'invalid player code' });
		}

		try {
			const playerData = await db
				.select()
				.from(player)
				.where(eq(player.code, code))
				.then((res) => res[0]);

			if (!playerData) {
				return message(form, { status: 400, text: 'invalid player code' });
			}

			const token = createPlayerJWT(playerData.id);

			cookies.set('player_token', token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict'
			});

			redirect(303, '/');
		} catch (error) {
			console.error(error);
			return message(form, { status: 500, text: 'internal server error' });
		}
	}
} satisfies Actions;
