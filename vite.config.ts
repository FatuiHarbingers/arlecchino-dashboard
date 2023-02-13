import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
	plugins: [sveltekit(), nodePolyfills()],
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version)
	}
});
