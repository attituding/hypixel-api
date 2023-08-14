# **hypixel-api**

hypixel-api is a Cloudflare worker setup that acts as a proxy to the Hypixel API as API requests are no longer allowed to be done on the client side via a user's own key.

## Features

* Multi project support
* Ratelimit handling for both the Hypixel API and inbound requests
* Easy and simple configuration
* Extendable
* Full test coverage

## Example

[Iris](https://chrome.google.com/webstore/detail/iris/eoimknngdbibmlhfkkfdjiaonaelahgo) is an browser extension that uses this system. You can view the configuration and route [by clicking here](./src/routes/iris.ts) or finding the /iris route in the source code.

## Setup

### Prerequisites

* A Cloudflare account (free tier is fine for up to 100,000 requests per day)
* Node.js

### Deploy an instance

1. Clone/download this repo
2. Run `npm i` to install dependencies
3. Modify code as needed
4. Use `npm run dev` to test out the project and any changes made
5. Run `npm deploy` to deploy
6. You will get prompted to log in if you haven't used wrangler before
7. Log into the Cloudflare dash and find your deployed worker
8. Set any environment variables as needed (such as HYPIXEL_API_KEY_IRIS in the Iris example)

## More Info

https://workers.cloudflare.com/

https://hypixel.net/threads/hypixel-developer-dashboard-public-api-changes-june-2023.5364455/
