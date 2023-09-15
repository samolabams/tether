# The Tether challenge

A simplified distributed exchange

# Approach
Grenache is used for communication between nodes. Two clients and two servers were set up.
Each client communicate with it's own server using RPC while communication between servers uses PubSub.

# Features

- Add Order
- Get Orders
- Sync Orders

## Installation

To run this service, you need to have the following dependencies installed:

- NodeJS [version 10 or greater](https://nodejs.org).

* Unzip the application folder
* Navigate to the project directory
* Install all dependencies using `npm install`
* Run `npm run build` to build project
* Run `npm run start` to start project (Navigate to src/main.ts to see example usage)

# What is Missing
Proper Data Validation -> Data and options should be fully validated
Race condition Management -> A consensus algorithm should be implemented to avoid data race
Partial Order Matching -> Orders are fully matched, a partial order matching should be implemented. Symbol is also ignore during matching

### Thank You