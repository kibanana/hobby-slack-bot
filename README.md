# hobby-info-slack-bot
> 📚 🎬 Scrape and Send hobby(book, movie) information

## Features

- 도서 정보 (Text, Image 지원)  
  Yes24의 카테고리 별 도서 정보를 가져옵니다
- 영화 정보 (Text, Image 지원)  
  네이버영화의 현재 상영영화 정보를 가져옵니다

## How it works
1. 유저가 '!영화' 또는 '!책'을 포함한 메시지를 보냅니다
2. 봇이 유저에게 정보를 보냅니다
    - 텍스트를 요청 받았을 때에는 정보를 스크래핑해서 보냅니다
    - 이미지를 요청 받았을 때에는 puppeteer로 얻어온 스크린샷을 Buffer 형태로 보냅니다

## Develop with
### Send message to Slack
`@slack/rtm-api`  
`@slack/interactive-messages`  
`express`  
`@types/node-fetch`  

### Scraping (Text)
`cherrio-httpcli`  

### Screenshot (Image)
`@types/puppeteer`  
`@types/node-fetch`  
`form-data`  

## Setup

```sh
npm i
```

## Usage
```sh
# After create config.ts or .env

npm start
# npm run start
# ts-node ./src/index
```
