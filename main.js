const rsi = require('trading-indicator').rsi
const { Promise } = require('bluebird');
const { IncomingWebhook } = require('@slack/webhook');
const url = `SETUP SLACK WEBHOOK URL`;

async function getOversold(ticker, exchange) {
    const myRSI = await rsi(14, "close", exchange, `${ticker}/USD`, "1h", true);
    for (let i = myRSI.length - 1; i > myRSI.length - 11; i--) {
        if (myRSI[i] <= 4) {
            return true;
        }
    }
    return false;
};

async function notifySlack(message) {
    // Initialize
    const webhook = new IncomingWebhook(url);
    await webhook.send({
        text: message,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${message}`
                }
            }
        ]
    });
}

async function main() {
    const binanceUSCoins =
        ["XRP", "LTC", "ADA", "BAT", "ETC", "XLM", "ZRX", "BCH", "BNB", "BTC", "ETH", "LINK", "DASH", "RVN", "ZEC", "ALGO", "BUSD", "DOGE", "IOTA", "ATOM", "NEO", "VET", "QTUM", "WAVES", "NANO", "ICX", "ENJ", "ONT", "ZIL", "XTZ", "HBAR", "OMG", "MATIC", "REP", "EOS", "KNC", "USDC", "VTHO", "COMP", "MANA", "MKR", "DAI", "ONE", "BAND", "STORJ", "HNT", "UNI", "SOL", "PAXG", "OXT", "EGLD", "ZEN"]

    for (let coin of binanceUSCoins) {
        const status = await getOversold(coin, "binanceus");
        if (status) {
            await notifySlack(`:newspaper: ${coin} is oversold on binance`);
        }
    }
    const coinBaseCoins =
        ["BTC", "ETH", "LTC", "ADA", "BCH", "EOS", "DASH", "OXT", "MKR", "XLM", "ATOM"]

    for (let coin of coinBaseCoins) {
        const status = await getOversold(coin, "coinbasepro");
        if (status) {
            await notifySlack(`:newspaper: ${coin} is oversold on coinbase`);
        }
    }
    await notifySlack(`:newspaper: test`);

    const waitTime = 450000;
    console.log(`Running at ${new Date(Date.now())}`);
    await Promise.delay(waitTime);
    return;
};

async function bot() {
    while (true) {
        await main();
    }
}
bot();
