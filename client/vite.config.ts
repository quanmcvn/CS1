import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), tsconfigPaths()],
	resolve: {
		alias: {
			"@api": resolve(__dirname, "./src/api"),
			"@components": resolve(__dirname, "./src/components"),
			"@pages": resolve(__dirname, "./src/pages"),
			"@service": resolve(__dirname, "./src/service"),
		}
	},
	server: {
		allowedHosts: [
			'.lhr.life'
		]
	}
})
