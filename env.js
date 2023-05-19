/*
The environment variables are set based on the single variable `MAINNET=true`
(or absence thereof) in the root `.env` file. The following env vars are then assigned in
`quasar.config.js`.
*/
require('dotenv').config()

const sharedEnv = {
	NETWORK_PROTOCOL: 'https',
	NETWORK_PORT: 443,
	TELOS_ORIGIN: 'http://localhost:3030',
	TOKENMANAGER_CONTRACT: 'tokenmanager',
	GOOGLE_ANALYTICS: 'UA-154600181-2',
	IMGUR_CLIENT_ID: 'b6f46df9d1da9d9',
	WEBSERVICES_API_KEY: 'XXX',
	NETWORK_ENV: 'shared'
}

const LOCAL = {
	...sharedEnv,
	APP_NAME: 'Telos Wishlist (local)',
	NETWORK_HOST: 'testnet.telos.caleos.io',
	NETWORK_CHAIN_ID:
		'1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f',
	WEBSERVICES_URL: 'https://api-dev.telos.net',
	HYPERION_URL: 'https://testnet.telos.caleos.io',
	BLOCKCHAIN_EXPLORER: 'https://explorer-test.telos.net',
	// NETWORK_ENV: 'testnet'
	NETWORK_ENV: 'local',
	GOODBLOCK_HOSTNAME: 'http://localhost:3888',
	COMMENT_INDEXER_HOSTNAME: 'http://localhost:3838'
}

const TESTNET = {
	...sharedEnv,
	APP_NAME: 'Telos Wishlist (testnet)',
	NETWORK_HOST: 'testnet.telos.caleos.io',
	NETWORK_CHAIN_ID:
		'1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f',
	WEBSERVICES_URL: 'https://api-dev.telos.net',
	HYPERION_URL: 'https://testnet.telos.caleos.io',
	BLOCKCHAIN_EXPLORER: 'https://explorer-test.telos.net',
	NETWORK_ENV: 'testnet',
	// GOODBLOCK_HOSTNAME: 'https://api.test.decidevoter.app',
	GOODBLOCK_HOSTNAME: 'http://localhost:3888',
	COMMENT_INDEXER_HOSTNAME: 'http://localhost:3838'
}

const MAINNET = {
	...sharedEnv,
	APP_NAME: 'Telos Wishlist',
	NETWORK_HOST: 'mainnet.telos.net',
	NETWORK_CHAIN_ID:
		'4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11',
	WEBSERVICES_URL: 'https://api.telos.net',
	HYPERION_URL: 'https://mainnet.telos.net',
	BLOCKCHAIN_EXPLORER: 'https://explorer.telos.net',
	NETWORK_ENV: 'mainnet',
	// GOODBLOCK_HOSTNAME: 'https://api.mainnet.decidevoter.app',
	GOODBLOCK_HOSTNAME: 'http://localhost:3888',
	COMMENT_INDEXER_HOSTNAME: 'http://localhost:3838'
}

const env =
	process.env.NETWORK === 'mainnet'
		? MAINNET
		: process.env.NETWORK === 'testnet'
		? TESTNET
		: LOCAL

module.exports = env
