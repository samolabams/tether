export enum OrderSide {
    BID = 'bid',
    ASK = 'ask'
}

class Order {    
    constructor(public readonly side: OrderSide, public readonly symbol: string, public readonly price: number, public time: Date) {}

    getKey(): string {
        return this.price.toString()
    }
}

export default Order