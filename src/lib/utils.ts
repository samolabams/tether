import { PeerRPCServer, PeerPub, PeerSub } from 'grenache-nodejs-ws'
import Link from 'grenache-nodejs-link'

export const createLink = (url: string) => {
    const link = new Link({
        grape: url,
        requestTimeout: 10000
    })
    link.start()

    return link
}

export const createPeer = (type: string, link: any) => {
    let peer: any

    switch (type) {
        case 'server':
            peer = new PeerRPCServer(link, {})
            break;
        case 'publish':
            peer = new PeerPub(link, {})
            break;
        case 'subscribe':
            peer = new PeerSub(link, {})
            break;
        default:
            throw new Error('Invalid peer type')
    }

    peer.init()

    return peer
}