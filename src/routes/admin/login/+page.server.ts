import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_USERNAME } from '$env/static/private';
import { createAdminJWT, verifyPassword } from '$lib/server/auth';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { toasts } from '$lib/stores/toast';

const loginSchema = z.object({
	username: z.string(),
	password: z.string()
});

export const load: PageServerLoad = async ({ request, cookies }) => {
	// If already logged in, redirect to admin dashboard
	const adminToken = cookies.get('admin_token');
	if (adminToken) {
		redirect(303, '/admin');
	}

	const form = await superValidate(request, zod(loginSchema));
	return { form };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await new Promise((resolve) => setTimeout(resolve, 300));

		if (form.data.username !== ADMIN_USERNAME) {
			return message(form, { status: 401, text: 'Invalid username or password' });
		}

		if (!(await verifyPassword(form.data.password))) {
			return message(form, { status: 401, text: 'Invalid username or password' });
		}

		const token = createAdminJWT();

		cookies.set('admin_token', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict'
		});

		toasts.success('Successfully logged in');
		redirect(303, '/admin');
	}
} satisfies Actions;
