// @ts-ignore
export default defineNuxtConfig({
	css: ['vuetify/lib/styles/main.sass'],
	/* run on port 3000 */

	build: {
		transpile: ['vuetify'],
	},
	vite: {
		define: {
			'process.env.DEBUG': false,
		},
	},
	runtimeConfig: {

		public: {
			baseURL: process.env.API_URL || 'http://localhost:1337',
			solanaRPC: process.env.SOLANA_RPC || 'https://api.devnet.solana.com',
		},
	},
})
