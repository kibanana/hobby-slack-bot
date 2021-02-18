# Hobby Slack Bot

> 📚 🎬 스크래핑한 취미(책, 영화) 정보를 슬랙에서 받자!


## Features

### 텍스트로 정보 받기

Yes24의 카테고리별 도서 정보를 가져옵니다.

### 이미지로 정보 받기

네이버영화의 현재 상영영화 정보를 가져옵니다.


## How it works
1. 책 정보를 받고싶으면 `!책`나 `!도서`, 영화 정보를 받고싶으면 `!영화` 메시지를 보냅니다.

    스크린샷을 받고싶으면 `이미지`, `사진`, `스크린샷`, `img`, `image`, `picture`, `screenshot` 중 한 단어를 입력합니다. ex) `!책 이미지`, `!영화 이미지`

2. Hobby Slack Bot이 요청 메시지를 보낸 유저에게 정보를 보냅니다.

\* `!h`: 도움말


## Develop with

### Send message to Slack
- `@slack/interactive-messages`
- `@slack/rtm-api`
- `express`
- `node-fetch`  

### Scrape Text
- `cheerio`
- `iconv-lite`
- `node-fetch`

### Get Screenshot(Image)
- `puppeteer`
- `form-data`
- `node-fetch`


## Setup

```sh
npm i
```


## Usage
```sh
npm start
# node dist/index.js
```
