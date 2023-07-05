import Vuex from 'vuex'
import AddressBook from "store/modules/AddressBook";
import ApiStatus from "store/modules/ApiStatus";
import App from "store/modules/App";
import Balance from "store/modules/Balance";
import Blockchain from "store/modules/Blockchain";
import CoinSwap from "store/modules/CoinSwap";
import Elysium from "store/modules/Elysium";
import Masternode from "store/modules/Masternode";
import Settings from "store/modules/Settings";
import Transactions from "store/modules/Transactions";

export default new Vuex.Store({
    modules: {
        AddressBook,
        ApiStatus,
        App,
        Balance,
        Blockchain,
        CoinSwap,
        Elysium,
        Masternode,
        Settings,
        Transactions,
    }
});