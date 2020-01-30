# hobby-info-slack-bot
> 📚 🎬 Scrape and Send hobby(book, movie) information

## Features

- 도서 정보 (Text, Image 지원)  
  Yes24의 카테고리 별 도서 정보를 가져옵니다
- 영화 정보 (Text, Image 지원)  
  네이버영화의 현재 상영영화 정보를 가져옵니다

### Send message to Slack
`@slack/rtm-api`  
`@slack/interactive-messages`  
`express`  
`node-fetch`  

### Scraping (Text)
`cherrio-httpcli`  

### Screenshot (Image)
`puppeteer`  
`node-fetch`  
`form-data`  

## Setup

```sh
npm i
```

## Usage
```sh
# After create config.ts

npm start
# npm run start
# ts-node ./src/index
```