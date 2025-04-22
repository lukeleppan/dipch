import { redirect, type Handle } from '@sveltejs/kit';
import { verifyAdminJWT } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Admin route protection
	if (event.url.pathname.startsWith('/admin')) {
		if (event.url.pathname === '/admin/login') {
			return await resolve(event);
		}

		const jwtToken = event.cookies.get('admin_token');
		if (!jwtToken) {
			throw redirect(303, '/admin/login');
		}

		const payload = verifyAdminJWT(jwtToken);

		if (!payload || !payload.isAdmin) {
			event.cookies.delete('admin_token', { path: '/' });
			throw redirect(303, '/admin/login');
		}

		event.locals.admin = { isAdmin: true };
	}

	return await resolve(event);
};
