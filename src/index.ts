import { RTMClient } from '@slack/rtm-api';
const { WebClient } = require('@slack/web-api');

import config from './config';
import { scrapeMovieText, scrapeMovieImage } from './scrapeMovie';
import { scrapeBookText } from './scrapeBook';
import * as bookUrl from './scrapeBook';

const token: string = config.SLACK_BOT_TOKEN;
const rtm = new RTMClient(token);
const web = new WebClient(token);

(async () => {
  await rtm.start();
})();

rtm.on('message', async (event) => {
  const text = event.text;

  // image send 후 사용자가 별다른 메시지를 보내지 않아도
  // Event가 발생해서 무한루프가 돌길래 if문으로 체크해서 종료
  if (!text.trim()) {
    return ;
  }

  try {
    await rtm.sendMessage(`Hello <@${event.user}>!`, event.channel);
    if (text.includes('!영화')) {
      const imageWordArr = ['이미지', '사진', '스크린샷', 'img', 'image', 'screenshot'];
      if (imageWordArr.includes(text.split('!영화')[1].trim())) {
        await scrapeMovieImage().then(async (result) => {
          if (result) {
            await rtm.sendMessage(`<${result}|Movie Image>`, event.channel);
          } else {
            await rtm.sendMessage(`An error occurred during getting movie image!`, event.channel);
          }
        });
      } else { // text가 default
        scrapeMovieText().then(async (movieInfo) => {
          if (movieInfo) {
            await rtm.sendMessage(movieInfo, event.channel);
          } else {
            await rtm.sendMessage(`An error occurred during getting movie information!`, event.channel);
          }
        });
      }
    } else if (text.includes('!책') || text.includes('!도서')) { // 책 1단계
      
      const result = await web.chat.postMessage({
        "text": "어떤 분류의 책 순위를 보고 싶으신가요?",
        "attachments": [
          {
            "fallback": "notBook",
            "callback_id": "book",
            "color": "#efdc05",
            "attachment_type": "default",
            "actions": [
              { "style": "primary", "name": "소설/시/희곡", "text": "소설/시/희곡", "type": "button", "value": "소설/시/희곡" },
              { "style": "primary", "name": "경제/경영", "text": "경제 경영", "type": "button", "value": "경제/경영" },
              { "style": "primary", "name": "사회/정치", "text": "사회 정치", "type": "button", "value": "사회/정치" },
              { "style": "primary", "name": "에세이", "text": "에세이", "type": "button", "value": "에세이" },
              { "style": "primary", "name": "여행", "text": "여행", "type": "button", "value": "여행" },
            ]
          },
          {
            "fallback": "notBook",
            "callback_id": "book",
            "color": "#efdc05",
            "attachment_type": "default",
            "actions": [
              { "style": "primary", "name": "역사", "text": "역사", "type": "button", "value": "역사" },
              { "style": "primary", "name": "예술", "text": "예술", "type": "button", "value": "예술" },
              { "style": "primary", "name": "자기계발", "text": "자기계발", "type": "button", "value": "자기계발" },
              { "style": "primary", "name": "자연과학", "text": "자연과학", "type": "button", "value": "자연과학" },
              { "style": "primary", "name": "인문", "text": "인문", "type": "button", "value": "인문" },
            ]
          },
          {
            "fallback": "notBook",
            "callback_id": "book",
            "color": "#efdc05",
            "attachment_type": "default",
            "actions": [
              { "name": "한국소설", "text": "한국소설", "type": "button", "value": "한국소설" },
              { "name": "영미소설", "text": "영미소설", "type": "button", "value": "영미소설" },
              { "name": "중국소설", "text": "중국소설", "type": "button", "value": "중국소설" },
              { "name": "프랑스소설", "text": "프랑스소설", "type": "button", "value": "프랑스소설" },
              { "name": "독일소설", "text": "독일소설", "type": "button", "value": "독일소설" },
            ]
          },
          {
            "fallback": "notBook",
            "callback_id": "book",
            "color": "#efdc05",
            "attachment_type": "default",
            "actions": [
              { "name": "러시아소설", "text": "러시아소설", "type": "button", "value": "러시아소설" },
              { "name": "스페인/중남미소설", "text": "스페인/중남미소설", "type": "button", "value": "스페인/중남미소설" },
              { "name": "북유럽소설", "text": "북유럽소설", "type": "button", "value": "북유럽소설" },
              { "name": "시/희곡", "text": "시/희곡", "type": "button", "value": "시/희곡" },
            ]
          }
        ],
        icon_emoji: ':books:',
        channel: event.channel,
      });
      
      return ;
      scrapeBookText(bookUrl.urlNovelPoemBest).then(async (bookInfo) => {
        if (bookInfo) {
          await rtm.sendMessage(bookInfo, event.channel);
        } else {
          await rtm.sendMessage(`An error occurred during getting book information!`, event.channel);
        }
      });
    } else {
      const reply = await rtm.sendMessage(`I can't understand what you said!`, event.channel);
    }
  } catch (error) {
    await rtm.sendMessage(`An error occurred`, event.channel);
  }
});