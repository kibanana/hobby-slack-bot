import { RTMClient } from '@slack/rtm-api';
import { WebClient } from '@slack/web-api';

import { scrapeMovieText, scrapeMovieImage } from './scrapeMovie';
import { scrapeBookText } from './scrapeBook';
import * as bookUrl from './scrapeBook';

import { config } from 'dotenv';
import configFile from './config';

config();

const token: string = process.env.SLACK_BOT_TOKEN ? process.env.SLACK_BOT_TOKEN : configFile.SLACK_BOT_TOKEN;
const rtm = new RTMClient(token);
const web = new WebClient(token);

(async () => {
  await rtm.start();
})();

rtm.on('message', async (event) => {
  const text: string = event.text ? event.text : ' ';

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
            "actions": [
              { "name": bookUrl.urlKoreanNovel.v, "text": bookUrl.urlKoreanNovel.v, "type": "button", "value": bookUrl.urlKoreanNovel.v },
              { "name": bookUrl.urlEngNovel.v, "text": bookUrl.urlEngNovel.v, "type": "button", "value": bookUrl.urlEngNovel.v },
              { "name": bookUrl.urlChineseNovel.v, "text": bookUrl.urlChineseNovel.v, "type": "button", "value": bookUrl.urlChineseNovel.v },
              { "name": bookUrl.urlFrenchNovel.v, "text": bookUrl.urlFrenchNovel.v, "type": "button", "value": bookUrl.urlFrenchNovel.v },
              { "name": bookUrl.urlGermanNovel.v, "text": bookUrl.urlGermanNovel.v, "type": "button", "value": bookUrl.urlGermanNovel.v },
            ]
          },
          {
            "fallback": "notBook",
            "callback_id": "book",
            "color": "#efdc05",
            "actions": [
              { "name": bookUrl.urlRussianNovel.v, "text": bookUrl.urlRussianNovel.v, "type": "button", "value": bookUrl.urlRussianNovel.v },
              { "name": bookUrl.urlSpanishNovel.v, "text": bookUrl.urlSpanishNovel.v, "type": "button", "value": bookUrl.urlSpanishNovel.v },
              { "name": bookUrl.urlEuropeNovel.v, "text": bookUrl.urlEuropeNovel.v, "type": "button", "value": bookUrl.urlEuropeNovel.v },
              { "name": bookUrl.urlPoem.v, "text": bookUrl.urlPoem.v, "type": "button", "value": bookUrl.urlPoem.v },
            ]
          },
          {
            "fallback": "notBook",
            "callback_id": "book",
            "color": "#efdc05",
            "actions": [
              { "style": "primary", "name": bookUrl.urlNovelPoemBest.v, "text": bookUrl.urlNovelPoemBest.v, "type": "button", "value": bookUrl.urlNovelPoemBest.v },
              { "style": "primary", "name": bookUrl.urlEconomyBest.v, "text": bookUrl.urlEconomyBest.v, "type": "button", "value": bookUrl.urlEconomyBest.v },
              { "style": "primary", "name": bookUrl.urlSocietyBest.v, "text": bookUrl.urlSocietyBest.v, "type": "button", "value": bookUrl.urlSocietyBest.v },
              { "style": "primary", "name": bookUrl.urlEssayBest.v, "text": bookUrl.urlEssayBest.v, "type": "button", "value": bookUrl.urlEssayBest.v },
              { "style": "primary", "name": bookUrl.urlTravelBest.v, "text": bookUrl.urlTravelBest.v, "type": "button", "value": bookUrl.urlTravelBest.v },
            ]
          },
          {
            "fallback": "notBook",
            "callback_id": "book",
            "color": "#efdc05",
            "actions": [
              { "style": "primary", "name": bookUrl.urlHistoryBest.v, "text": bookUrl.urlHistoryBest.v, "type": "button", "value": bookUrl.urlHistoryBest.v },
              { "style": "primary", "name": bookUrl.urlArtBest.v, "text": bookUrl.urlArtBest.v, "type": "button", "value": bookUrl.urlArtBest.v },
              { "style": "primary", "name": bookUrl.urlSelfImprovementBest.v, "text": bookUrl.urlSelfImprovementBest.v, "type": "button", "value": bookUrl.urlSelfImprovementBest.v },
              { "style": "primary", "name": bookUrl.urlScienceBest.v, "text": bookUrl.urlScienceBest.v, "type": "button", "value": bookUrl.urlScienceBest.v },
              { "style": "primary", "name": bookUrl.urlHumanitiesBest.v, "text": bookUrl.urlHumanitiesBest.v, "type": "button", "value": bookUrl.urlHumanitiesBest.v },
            ]
          }
        ],
        icon_emoji: ':books:',
        channel: event.channel,
      });
      
      scrapeBookText(bookUrl.urlNovelPoemBest.url).then(async (bookInfo) => {
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