import {Store} from "vuex";
import {Router} from "vue-router";
import {Firod} from "../../daemon/firod";

type StoreAPI = any;

export interface ExtendedWindow extends Window {
    $store: Store<StoreAPI>;
    $router: Router;
    $setWaitingReason: (reason: string, final?: boolean) => void;
    $quitApp: (message?: string) => Promise<void>;
    $startDaemon: () => Promise<void>;
    $daemon: Firod;
    Firod?: typeof Firod;
}