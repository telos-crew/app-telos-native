const routes = [
    {
        path: '/login',
        component: () => import('pages/login/LoginPage.vue'),
        meta: { layout: 'guest', title: 'pages.login.title', guest: true },
    },
    {
        path: '/accounts/add',
        component: () => import('pages/accounts/add/CreateAccount.vue'),
        meta: {
            layout: 'guest',
            title: 'pages.accounts.add.title',
            guest: true,
        },
    },
    {
        path: '/accounts/add/congratulations',
        component: () => import('pages/accounts/add/CongratulationsPage.vue'),
        meta: { layout: 'empty', guest: true },
    },
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
    routes.push({
        path: '/(.*)*',
        component: () => import('pages/404.vue'),
        meta: { layout: 'empty' },
    });
}

export default routes;
