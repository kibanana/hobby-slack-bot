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

const errorMessage = "An error occurred";
const unrecogErrorMessage = "I can't understand what you said!";

rtm.on('message', async (event) => {
  console.log(event);
  console.log(`message: ${event.text}`);
  const text: string = event.text ? event.text : ' ';

  // image send 후 사용자가 별다른 메시지를 보내지 않아도
  // Event가 발생해서 무한루프가 돌길래 if문으로 체크해서 종료
  if (!((!text.trim()) || text.includes(errorMessage) || text.includes(unrecogErrorMessage) || text.includes('Hello'))) {
    try {
      // await rtm.sendMessage(`Hello <@${event.user}>!`, event.channel);
      if (text.includes('!영화')) {
        const imageWordArr = ['이미지', '사진', '스크린샷', 'img', 'image', 'screenshot'];
        if (imageWordArr.includes(text.split('!영화')[1].trim())) {
          await scrapeMovieImage().then(async (result) => {
            if (result) {
              await rtm.sendMessage(`<${result}|Movie Image>`, event.channel);
            } else {
              await rtm.sendMessage(`${errorMessage} during getting movie image!`, event.channel);
              return ;
            }
          });
        } else { // text가 default
          scrapeMovieText().then(async (movieInfo) => {
            if (movieInfo) {
              await rtm.sendMessage(movieInfo, event.channel);
            } else {
              await rtm.sendMessage(`${errorMessage} during getting movie information!`, event.channel);
              return ;
            }
          });
        }
      } else if (text.includes('!책') || text.includes('!도서')) { // 책 1단계
  
        const slackWebHookUrl = process.env.SLACK_WEBHOOK_URL ? process.env.SLACK_WEBHOOK_URL : configFile.SLACK_WEBHOOK_URL;
        const confirmObj = {
          "title": "Are you sure?",
          "text": "Wouldn\'t you prefer other category?",
          "ok_text": "Yes",
          "dismiss_text": "No"
        };
        const actionId:string = 'bookSelect';

        await web.chat.postMessage({
          type: "block_actions",
          icon_emoji: ':books:',
          channel: event.channel,
          // thread_ts: event.ts, // 사용성 저하 우려
          token: token,
          response_type: "in_channel",
          response_url: slackWebHookUrl,
  
          text: "hobby-info-slack-bot",
          action_id: actionId,
          "blocks": [
            {
              "type": "actions",
              "block_id": actionId,
              "text": {
                "type": "mrkdwn",
                "text": "어떤 *책* 의 순위를 보고 싶으신가요?"
              },
              "accessory": {
                "action_id": actionId,
                "type": "static_select",
                "placeholder": {
                  "type": "plain_text",
                  "text": "카테고리를 선택하세요"
                },
                "option_groups": [
                  {
                    "label": {
                      "type": "plain_text",
                      "text": "Book"
                    },
                    "options": [
                      { "text": { "type": "plain_text", "text": bookUrl.urlNovelPoemBest.v }, "value": bookUrl.urlNovelPoemBest.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlEconomyBest.v }, "value": bookUrl.urlEconomyBest.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlSocietyBest.v }, "value": bookUrl.urlSocietyBest.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlEssayBest.v }, "value": bookUrl.urlEssayBest.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlTravelBest.v }, "value": bookUrl.urlTravelBest.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlHistoryBest.v }, "value": bookUrl.urlHistoryBest.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlArtBest.v }, "value": bookUrl.urlArtBest.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlSelfImprovementBest.v }, "value": bookUrl.urlSelfImprovementBest.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlScienceBest.v }, "value": bookUrl.urlScienceBest.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlHumanitiesBest.v }, "value": bookUrl.urlHumanitiesBest.name },
                    ]
                  },
                  {
                    "label": {
                      "type": "plain_text",
                      "text": "Novel"
                    },
                    "options": [
                      { "text": { "type": "plain_text", "text": bookUrl.urlKoreanNovel.v }, "value": bookUrl.urlKoreanNovel.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlEngNovel.v }, "value": bookUrl.urlEngNovel.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlChineseNovel.v }, "value": bookUrl.urlChineseNovel.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlFrenchNovel.v }, "value": bookUrl.urlFrenchNovel.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlGermanNovel.v }, "value": bookUrl.urlGermanNovel.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlRussianNovel.v }, "value": bookUrl.urlRussianNovel.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlSpanishNovel.v }, "value": bookUrl.urlSpanishNovel.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlEuropeNovel.v }, "value": bookUrl.urlEuropeNovel.name },
                      { "text": { "type": "plain_text", "text": bookUrl.urlPoem.v }, "value": bookUrl.urlPoem.name },
                    ]
                  }
                ],
              }
            },
          ]
        });

        return ;
        scrapeBookText(bookUrl.urlNovelPoemBest.url).then(async (bookInfo) => {
          if (bookInfo) {
            await rtm.sendMessage(bookInfo, event.channel);
          } else {
            await rtm.sendMessage(`${errorMessage} during getting book information!`, event.channel);
            return ;
          }
        });
      } else {
        if ((!text.trim()) || text.includes(errorMessage) || text.includes(unrecogErrorMessage) || text.includes('Hello')) {
          console.log('error111');
          await rtm.sendMessage(unrecogErrorMessage, event.channel);
          return ;
        }
      }
    } catch (error) {
      if ((!text.trim()) || text.includes(errorMessage) || text.includes(unrecogErrorMessage) || text.includes('Hello')) {
        console.log('error222');
        await rtm.sendMessage(errorMessage, event.channel);
        return ;
      }
    }
  } else {
    return ;
  }
});