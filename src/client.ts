import { PeerRPCClient } from 'grenache-nodejs-ws'
import Link from 'grenache-nodejs-link'
import { ObjectLiteral } from './lib/types'

type ClientOption = {
  name: string;
  grapeUrl: string;
}

class Client {
  private name: string;
  private peer: any

  constructor({ name, grapeUrl }: ClientOption) {
    this.name = name;

    const link = new Link({
      grape: grapeUrl,
      requestTimeout: 10000
    })
    link.start()

    this.peer = new PeerRPCClient(link, {})
    this.peer.init()
  }

  async sendRequest(command: string, payload: ObjectLiteral) {
    return new Promise((resolve, reject) => {
      this.peer.request(command, payload, { timeout: 100000 }, (err, result) => {
        if (err) {
          this.logRequest(`Request errored [${command}]`, err)
          reject(err)
        }
        this.logRequest(`Response received [${command}]`, result)
        resolve(result)
      })
    });
  }

  logRequest(...data: any[]) {
    const args = Array.prototype.slice.call(arguments);
        
    args.unshift(`[${this.name}]:`);
        
    console.log.apply(console, args);
}
}

export default Client
