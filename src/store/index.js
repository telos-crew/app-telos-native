import { createStore } from 'vuex';

import accounts from './accounts';
import profiles from './profiles';
import notifications from './notifications';
import general from './general';
import { store } from 'quasar/wrappers';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default store(function (/* { ssrContext } */) {
    const Store = createStore({
        modules: {
            accounts,
            profiles,
            notifications,
            general,
        },

        // enable strict mode (adds overhead!)
        // for dev mode only
        strict: process.env.DEV,
    });

    return Store;
});
