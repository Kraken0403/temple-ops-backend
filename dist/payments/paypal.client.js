"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paypalClient = paypalClient;
const paypal = require("@paypal/checkout-server-sdk");
function paypalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('PayPal client ID or secret missing');
    }
    const environment = process.env.PAYPAL_ENV === 'production'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    return new paypal.core.PayPalHttpClient(environment);
}
//# sourceMappingURL=paypal.client.js.map