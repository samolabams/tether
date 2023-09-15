import Order, { OrderSide } from './order'
import { ObjectLiteral } from './lib/types'

type OrderList = Map<string, Order[]>

class OrderBook {
    constructor() {}

    private bids = new Map<string, Order[]>()
    private asks = new Map<string, Order[]>()

    addOrder(payload: ObjectLiteral) {
        const order = new Order(payload.side, payload.symbol, payload.price, new Date())

        const matchedOrder = this.matchOrder(order)

        if (matchedOrder) {
            return {
                message: 'Order matched',
                data: {
                    yourOrder: JSON.stringify(order),
                    mactchedBy: JSON.stringify(matchedOrder),
                }
            }
        } else {
            this.saveOrder(order)

            return {
                message: 'Order submitted for matching',
                data: {
                    yourOrder: JSON.stringify(order),
                }
            }
        }
    }

    matchOrder(order: Order) {
        // search for order with the same price in the opposite list
        const ordersToSearch = order.side ===  OrderSide.BID ? this.asks : this.bids

        const key = order.getKey()

        const matchingOrders = (ordersToSearch.get(key) || [])
        if (matchingOrders.length > 0) {
            const matchedOrder = matchingOrders.shift();

            // save the order
            ordersToSearch.set(key, matchingOrders)

            return matchedOrder
        }

        return null
    }
    
    saveOrder(order: Order) {
        const key = order.getKey()

        if (order.side == OrderSide.BID) {
            this.bids.set(key, [...(this.bids.get(key) || []), order])
        } else {
            this.asks.set(key, [...(this.asks.get(key) || []), order])
        }
    }

    setOrders({ orders }: { orders: { bids: any[], asks: any[] } }) {
        this.bids = new Map(
            orders.bids.map(bid => {
              return [bid.price, JSON.parse(bid.orders)];
            }),
        );

        this.asks = new Map(
            orders.asks.map(ask => {
              return [ask.price, JSON.parse(ask.orders)];
            }),
        );
    }

    getOrders() {
        return {
            bids: this.printOrders(this.bids),
            asks: this.printOrders(this.asks)
        }
    }
    
    printOrders(ordersByPrice: OrderList) {
        const orderList = []

        for (const [price, orders] of ordersByPrice) {
            orderList.push({
                price,
                orders: JSON.stringify(orders)
            })
        }

        return orderList
    }
}

export default OrderBook