import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { Check, OctagonX, Info, OctagonAlert, type Icon as IconType } from '@lucide/svelte';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface Toast {
	id: string;
	icon: typeof IconType;
	message: string;
	type: ToastType;
	duration: number;
	timeoutId?: ReturnType<typeof setTimeout>;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function addToast(
		message: string,
		type: ToastType = 'info',
		icon: typeof IconType = Info,
		duration: number = 3000
	) {
		if (!browser) return;

		const id = crypto.randomUUID();

		const newToast: Toast = {
			id,
			message,
			type,
			icon,
			duration
		};

		update((toasts) => [...toasts, newToast]);

		const timeoutId = setTimeout(() => {
			removeToast(id);
		}, duration);

		// Store the timeout ID
		update((toasts) => toasts.map((t) => (t.id === id ? { ...t, timeoutId } : t)));

		return id;
	}

	function removeToast(id: string) {
		if (!browser) return;

		update((toasts) => {
			// Clear any existing timeout
			const toast = toasts.find((t) => t.id === id);
			if (toast?.timeoutId) {
				clearTimeout(toast.timeoutId);
			}
			return toasts.filter((toast) => toast.id !== id);
		});
	}

	function pauseToast(id: string) {
		if (!browser) return;

		update((toasts) => {
			return toasts.map((toast) => {
				if (toast.id === id) {
					// Clear the current timeout
					if (toast.timeoutId) {
						clearTimeout(toast.timeoutId);
					}

					return {
						...toast,
						timeoutId: undefined
					};
				}
				return toast;
			});
		});
	}

	function resumeToast(id: string) {
		if (!browser) return;

		update((toasts) => {
			return toasts.map((toast) => {
				if (toast.id === id) {
					// Create a new timeout with remaining time
					const timeoutId = setTimeout(() => {
						removeToast(id);
					}, toast.duration);

					return {
						...toast,
						timeoutId,
						startTime: Date.now()
					};
				}
				return toast;
			});
		});
	}

	return {
		subscribe,
		success: (message: string, icon: typeof IconType = Check, duration?: number) =>
			addToast(message, 'success', icon, duration),
		error: (message: string, icon: typeof IconType = OctagonX, duration?: number) =>
			addToast(message, 'error', icon, duration),
		info: (message: string, icon: typeof IconType = Info, duration?: number) =>
			addToast(message, 'info', icon, duration),
		warning: (message: string, icon: typeof IconType = OctagonAlert, duration?: number) =>
			addToast(message, 'warning', icon, duration),
		remove: removeToast,
		pause: pauseToast,
		resume: resumeToast
	};
}

export const toasts = createToastStore();
