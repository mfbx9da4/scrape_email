## Scrape emails

- Provide either a json file with list of names
- Scrapes google first page for `${name} contact`  @
- Then scrapes first few links until it finds @ on page

## Method

part 1 - save html files:
- create html files for all google pages and top results
- in parallel
- would be faster to store in db

part 2 - read each html file:
- scrape for email regex, accumalate all email

## Naming

Always prefix functions and files with either `fetchBar` or `extractFoo`

## Getting Started

requries docker and docker compose

    docker-compose up
    yarn

Use for debugging values

    npm install -g redis-commander
    redis-commander

## Deploying


	╰─$ aws ecr get-login --no-include-email --region eu-west-2
	## paste output to login
	╰─$ docker tag email_leads:latest 016582366134.dkr.ecr.eu-west-2.amazonaws.com/scrape_email:latest
	╰─$ docker push 016582366134.dkr.ecr.eu-west-2.amazonaws.com/scrape_email:latest

## Run Once

See package.json for scripts

    node index.js

## Streamlining: When to update db?

- Individual agents should be updated independent of other agents therefore:
- Wait for all subpages to be scraped before updating an agent record? YES
- Wait for all properties to be scraped before updating an agent record? YES
- Wait for all agents to be scraped before updating an agent record? NO
- Wait for all regions to be scraped before updating an agent record? NO
- => Emit an event everytime you extract some data completely for an agent
- Emit an event when:
    - Found agent name, address, etc
    - Extracted agent property stats
    - Extracted agent email


## API
- Get email for query
- Get email for list of queries


## TODO
- Support upload csv native upload
- Support download


