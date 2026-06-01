import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			includeAssets: ['pwa-icon.svg'],
			manifest: {
				name: '테니스월드 스코어보드',
				short_name: '테니스월드',
				description: '테니스 동호회 스코어보드',
				theme_color: '#1e293b',
				background_color: '#1e293b',
				display: 'standalone',
				orientation: 'portrait',
				lang: 'ko',
				start_url: '/',
				icons: [
					{
						src: '/pwa-icon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any'
					},
					{
						src: '/pwa-icon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}']
			},
			devOptions: {
				enabled: true
			}
		})
	]
});
