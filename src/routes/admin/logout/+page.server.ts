import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: ({ cookies }) => {
		// Clear admin token
		cookies.delete('admin_token', { path: '/' });
		redirect(303, '/admin/login');
	}
} satisfies Actions;
