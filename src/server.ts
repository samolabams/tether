import { createLink, createPeer } from './lib/utils'
import OrderBook from './order-book'

type ServerOptions = {
    name: string,
    grapeUrl: string
    rpcServicePort: number
    publishServicePort: number
}

class Server {
    private name: string
    private rpcService: any
    private publishService: any
    private orderBook: OrderBook
    private subscriptionTopic = 'sync-order';

    constructor({ name, grapeUrl, rpcServicePort, publishServicePort }: ServerOptions) {
        this.name = name;
        const serverLink = createLink(grapeUrl)
        const publishLink = createLink(grapeUrl)
        const subscribeLink = createLink(grapeUrl)

        const rpcServerPeer = createPeer('server', serverLink)
        const publishPeer = createPeer('publish', publishLink)
        const subscribePeer = createPeer('subscribe', subscribeLink)

        this.rpcService = rpcServerPeer.transport('server')
        this.rpcService.listen(rpcServicePort)

        this.publishService = publishPeer.transport('server')
        this.publishService.listen(publishServicePort)
        
        this.announceServices(serverLink, publishLink)

        this.subscribeForNewOrder(subscribePeer)

        // create a new order book
        this.orderBook = new OrderBook()
    }

    private announceServices(serverLink, publishLink) {
        const announce = () => {
            serverLink.announce('add_order', this.rpcService.port, {})
            serverLink.announce('get_orders', this.rpcService.port, {})
            publishLink.announce(this.subscriptionTopic, this.publishService.port, {})
        }

        announce()
        setInterval(() => {
            announce()
        }, 1000)
    }

    private subscribeForNewOrder(subsribePeer: any) {
        subsribePeer.sub(this.subscriptionTopic, { timeout: 10000 })

        subsribePeer.on('connected', () => {
            this.logRequest('Subscribed to topic', this.subscriptionTopic)
        })

        subsribePeer.on('message', (payload) => {
            try {
                const payloadObj = JSON.parse(payload)

                if (payload.server === this.name) {
                    // don't consume your own message
                    return;
                }

                this.logRequest('Received order updates', payload)

                this.orderBook.setOrders(payloadObj)
            } catch (err) {
                this.logRequest('Invalid payload')
            }
        })
    }

    listen() {
        this.rpcService.on('request', (rid, key, payload, handler) => {
            this.logRequest('request received', rid, key, payload)

            const res = this.executeCommand(key, payload)

            if (res === null) {
                handler.reply(null, 'You are not allowed to perform this action')
            }

            handler.reply(null, res)
        })
    }

    close() {
        this.rpcService.unlisten()
    }

    private syncOrders() {
        const orders = this.orderBook.getOrders()
        this.publishService.pub(JSON.stringify({
            server: this.name,
            orders: orders
        }))
    }

    private executeCommand(command: string, payload) {
        switch (command) {
            case 'add_order':
                const response = this.orderBook.addOrder(payload)
                this.syncOrders()

                return response
            case 'get_orders':
                return this.orderBook.getOrders()
            default:
                return null
        }
    }

    logRequest(...data: any[]) {
        const args = Array.prototype.slice.call(arguments);
            
        args.unshift(`[${this.name}]:`);
            
        console.log.apply(console, args);
    }
}

export default Server
