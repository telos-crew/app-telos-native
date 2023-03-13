import { resolveRoutes } from 'src/pages/resolve/routes'

const routes = [
	{
		path: '/login',
		component: () => import('pages/login/LoginPage.vue'),
		meta: { layout: 'guest', title: 'pages.login.title', guest: true }
	},
	{
		path: '/accounts/add',
		component: () => import('pages/accounts/add/CreateAccount.vue'),
		meta: { layout: 'guest', title: 'pages.accounts.add.title', guest: true }
	},
	{
		path: '/accounts/add/congratulations',
		component: () => import('pages/accounts/add/CongratulationsPage.vue'),
		meta: { layout: 'empty', guest: true }
	},

	// arbitration portal
	{
		path: '/resolve',
		component: () => import('pages/resolve/ResolvePortal.vue'),
		name: 'resolvePortal',
		children: [...resolveRoutes]
	},
	{
		path: '/wishlist',
		component: () => import('pages/wishlist/Wishlist.vue'),
		name: 'wishlist'
	},
	{
		path: '/wishlist/item/:ballot_name',
		component: () => import('src/pages/wishlist/WishlistBallot.vue'),
		name: 'wishlistItem',
		params: { dynamicName: true },
		props: true
	}
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
	routes.push({
		path: '/(.*)*',
		component: () => import('pages/404.vue'),
		meta: { layout: 'empty' }
	})
}

export default routes
