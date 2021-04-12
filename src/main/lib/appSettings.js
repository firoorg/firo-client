import { getAppSettings } from 'lib/utils';

export const populateStoreWithAppSettings = async function ({store}) {
    const appSettings = getAppSettings();
    const settings = await appSettings.getAll();

    // Migrate legacy names.
    if (!settings.isInitialized && settings['app.SET_IS_INITIALIZED']) {
        settings.isInitialized = settings['app.SET_IS_INITIALIZED'];
        settings.network = settings['app.SET_ZCOIN_CLIENT_NETWORK'];
        settings.blockchainLocation = settings['app.SET_BLOCKCHAIN_LOCATION'];

        await appSettings.set('app.SET_IS_INITIALIZED', false);
        await appSettings.set('app.SET_ZCOIN_CLIENT_NETWORK', false);
        await appSettings.set('app.SET_BLOCKCHAIN_LOCATION', false);

        await appSettings.set('isInitialized', settings.isInitialized);
        await appSettings.set('network', settings.network);
        await appSettings.set('blockchainLocation', settings.blockchainLocation);
    }

    if (process.env.NETWORK) settings.network = process.env.NETWORK;
    if (process.env.BLOCKCHAIN_LOCATION) settings.blockchainLocation = process.env.BLOCKCHAIN_LOCATION;
    if (process.env.FIROD_ARGS) settings.temporaryFirodArguments = process.env.FIROD_ARGS.split(' ');
    if (process.env.IS_INITIALIZED) {
        settings.isInitialized = !!JSON.parse(process.env.IS_INITIALIZED);
    } else if (process.env.NETWORK && process.env.BLOCKCHAIN_LOCATION) {
        settings.isInitialized = true;
    }

    if (settings.temporaryFirodArguments) {
        await appSettings.set('temporaryFirodArguments', false);
        store.commit('App/setTemporaryFirodArguments', settings.temporaryFirodArguments)
    }

    if (settings.isInitialized) {
        store.commit('App/setFiroClientNetwork', settings.network);
        store.commit('App/setBlockchainLocation', settings.blockchainLocation);
        store.commit('App/setIsInitialized', settings.isInitialized);
    }
};
