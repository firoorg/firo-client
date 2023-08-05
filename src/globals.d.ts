import { Store } from "vuex";
import { Router } from "vue-router";
import { Firod as Firod_ } from "src/daemon/firod";

type StoreAPI = any;
declare global {
    type Firod = Firod_;
    let $router: Router;
    let $setWaitingReason: (reason: string, final?: boolean) => void;
    let $quitApp: (message?: string) => Promise<void>;
    let $startDaemon: () => Promise<void>;
    let $store: Store<StoreAPI>;
    let $daemon: Firod;
}