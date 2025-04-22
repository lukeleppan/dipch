import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Theme = 'dark' | 'light';

const createThemeStore = () => {
	const defaultTheme: Theme = 'dark';

	const { subscribe, set, update } = writable<Theme>(defaultTheme);

	return {
		subscribe,
		toggle: () =>
			update((theme) => {
				const newTheme = theme === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					document.documentElement.classList.toggle('dark', newTheme === 'dark');
				}
				return newTheme;
			}),
		initialize: () => {
			if (browser) {
				const savedTheme = localStorage.getItem('theme') as Theme | null;
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

				const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

				set(initialTheme);
				document.documentElement.classList.toggle('dark', initialTheme === 'dark');
			}
		}
	};
};

export const theme = createThemeStore();
