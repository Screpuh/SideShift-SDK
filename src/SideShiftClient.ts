import { SideShiftHttpHandler } from './api/sideShiftHttpClient';
import { AccountAPI, CreateCheckoutAPI, OrdersAPI, PairsAPI } from './api/private';
import { CheckoutAPI, CoinsAPI, ShiftsAPI, StatsAPI } from './api/public';
import { SideShiftConfig } from './types';

export class SideShiftClient {
    // Public APIs
    public coins: CoinsAPI;
    public shifts: ShiftsAPI;
    public stats: StatsAPI;
    public checkout: CheckoutAPI;

    // Private APIs
    public pairs: PairsAPI;
    public account: AccountAPI;
    public orders: OrdersAPI;
    public createCheckout: CreateCheckoutAPI;

    constructor(config: SideShiftConfig) {
        const httpHandler = new SideShiftHttpHandler(config);

        // public APIs
        this.coins = new CoinsAPI(httpHandler);
        this.shifts = new ShiftsAPI(httpHandler);
        this.stats = new StatsAPI(httpHandler);
        this.checkout = new CheckoutAPI(httpHandler);

        // private APIs
        this.pairs = new PairsAPI(httpHandler);
        this.account = new AccountAPI(httpHandler);
        this.orders = new OrdersAPI(httpHandler);
        this.createCheckout = new CreateCheckoutAPI(httpHandler);
    }
}
