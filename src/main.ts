import Client from './client'
import Server from './server'

async function main() {
    // start server A
    const serverAUrl = 'http://127.0.0.1:30001'
    const serverA = new Server({
        name: 'server-a',
        grapeUrl: serverAUrl,
        rpcServicePort: 1337,
        publishServicePort: 1338
    })
    serverA.listen()

    // start server B
    const serverBUrl = 'http://127.0.0.1:40001'
    const serverB = new Server({
        name: 'server-b',
        grapeUrl: serverBUrl,
        rpcServicePort: 1339,
        publishServicePort: 1440
    })
    serverB.listen()

    // client A
    const clientA = new Client({
        name: 'client-a',
        grapeUrl: serverAUrl
    })

    // client B
    const clientB = new Client({
        name: 'client-b',
        grapeUrl: serverBUrl
    })

    await clientA.sendRequest("add_order", {
        side: "bid",
        symbol: "USDT",
        price: 1223
    })
    await clientA.sendRequest("add_order", {
        side: "bid",
        symbol: "USDT",
        price: 4556
    })
    await clientA.sendRequest("add_order", {
        side: "ask",
        symbol: "USDT",
        price: 4556
    })
    await clientA.sendRequest("get_orders", {})

    await clientB.sendRequest("add_order", {
        side: "bid",
        symbol: "USDT",
        price: 4566
    })    
    await clientB.sendRequest("get_orders", {})

    process
        .on('uncaughtException', (err) => {
        closeServers(serverA, serverB)
        process.exit(1);
    })
    .on('SIGINT', () => {
        closeServers(serverA, serverB)
        process.exit(0);
    })
    .on('SIGTERM', () => {
        closeServers(serverA, serverB)
        process.exit(0);
    });
}

function closeServers(serverA, serverB) {
    serverA.close();
    serverB.close();
}

main()