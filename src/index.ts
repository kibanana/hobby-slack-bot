import { RTMClient } from '@slack/rtm-api';
import { createMessageAdapter } from '@slack/interactive-messages';

import fetch from 'node-fetch';
import FormData from 'form-data';
import http from 'http';
import express from 'express';

import { scrapeMovieText } from './scrapeMovie';
import { categoryArr, categoryNameArr, scrapeBookText } from './scrapeBook';
import { getScreenshot, scrapeMovieImageWithAWS } from './getScreenshot';

import { config } from 'dotenv';
import configFile from './config';

config();

const signingToken: string = process.env.SIGNING_TOKEN ? process.env.SIGNING_TOKEN : configFile.SIGNING_TOKEN;
const apiToken: string = process.env.API_TOKEN ? process.env.API_TOKEN : configFile.API_TOKEN;
const token: string = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : configFile.ACCESS_TOKEN;
const port: number = process.env.PORT ? Number(process.env.PORT) : configFile.PORT;
const channel: string = process.env.CHANNEL ? process.env.CHANNEL : configFile.CHANNEL;
const slackWebHookUrl = process.env.SLACK_WEBHOOK_URL ? process.env.SLACK_WEBHOOK_URL : configFile.SLACK_WEBHOOK_URL;
const actionId: string = 'bookSelect';
const errorMessage: string = "An error occurred";
const bookInteractiveMessage: string = "어떤 *책* 의 순위를 보고 싶으신가요?";
const bookPlainInteractiveMessage: string = "어떤 책 의 순위를 보고 싶으신가요?";
const imageWordArr: string[] = ['이미지', '사진', '스크린샷', 'img', 'image', 'picture', 'screenshot'];

const slackInteractions = createMessageAdapter(signingToken);

const app = express();

app.get('*', (req, res) => {

})

app.post('/slack/actions', slackInteractions.expressMiddleware());
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});

interface IselectPayload {
  type: string,
  actions: [
    {
      name: string,
      type: string,
      selected_options: {
        '0': {
          value: string
        }
      }
    }
  ]
}

slackInteractions.action(actionId, async (payload: IselectPayload, respond: any) => {
  const categoryResult: string = payload.actions[0].selected_options['0']['value'];
  let categoryResultIdx: number = 0;
  let flag = true;

  if (categoryResult.includes('Img')) {
    categoryResultIdx = categoryNameArr.indexOf(categoryResult.split('Img')[0].trim());
    try {
      await getScreenshot(categoryArr[categoryResultIdx].url).then(async (result) => {
        if (result) {
          sendImage(result);
        } else {
          throw new Error();
        }
      });
    } catch (err) {
      flag = false;
      await rtm.sendMessage(`${errorMessage} during getting book image!`, channel);
    }
  } else { // text가 default
    try {
      categoryResultIdx = categoryNameArr.indexOf(categoryResult);
      scrapeBookText(categoryArr[categoryResultIdx].url).then(async (bookInfo) => {
        if (bookInfo) {
          await rtm.sendMessage(bookInfo, channel);
        } else {
          throw new Error();
        }
      });
    } catch (err) {
      flag = false;
      await rtm.sendMessage(`${errorMessage} during getting book information!`, channel);
    }
  }

  if (flag) {
    await respond({
      text: `*${categoryArr[categoryResultIdx].v}* 카테고리 선택`,
      response_type: 'in_channel',
      replace_original: true
    }); 
  }
});

const rtm = new RTMClient(token);

(async () => {
  await rtm.start();
})();

try {
  rtm.on('message', async (event) => {
    const text: string = event.text || '';
  
    // Bot에서 보낸 메시지도 event로 취급돼서 무한루프가 돌길래 if문으로 체크
    if (!((!text.trim()) || text.includes(errorMessage)) || text.includes(bookInteractiveMessage) || text.includes(bookPlainInteractiveMessage)) {
      try {
        //  || text.includes('Hello')
        // await rtm.sendMessage(`Hello <@${event.user}>!`, event.channel);
        if (text.includes('!영화')) {
          if (imageWordArr.includes(text.split('!영화')[1].trim())) {
            const MOVIE_URL = 'https://movie.naver.com/movie/running/current.nhn#';
  
            // await scrapeMovieImageWithAWS(MOVIE_URL).then(async (result) => {
            //   if (result) {
            //     await rtm.sendMessage(`<${result}|Movie Image>`, event.channel);
            //   } else {
            //     await rtm.sendMessage(`${errorMessage} during getting movie image!`, event.channel);
            //     return ;
            //   }
            // });
            try {
              await getScreenshot(MOVIE_URL).then(async (result) => {
                if (result) {
                  sendImage(result);
                } else {
                  throw new Error();
                }
              });
            } catch (err) {
              await rtm.sendMessage(`${errorMessage} during getting movie image!`, event.channel);
            }
          } else { // text가 default
            try {
              scrapeMovieText().then(async (movieInfo) => {
                if (movieInfo) {
                  await rtm.sendMessage(movieInfo, event.channel);
                } else {
                  throw new Error();
                }
              });
            } catch (err) {
              await rtm.sendMessage(`${errorMessage} during getting movie information!`, event.channel);
            }
          }
        } else if (text.includes('!책') || text.includes('!도서')) { // 책 1단계
          let bookOption = [
            { "text": categoryArr[0].v, "value": categoryArr[0].name },
            { "text": categoryArr[1].v, "value": categoryArr[1].name },
            { "text": categoryArr[2].v, "value": categoryArr[2].name },
            { "text": categoryArr[3].v, "value": categoryArr[3].name },
            { "text": categoryArr[4].v, "value": categoryArr[4].name },
            { "text": categoryArr[5].v, "value": categoryArr[5].name },
            { "text": categoryArr[6].v, "value": categoryArr[6].name },
            { "text": categoryArr[7].v, "value": categoryArr[7].name },
            { "text": categoryArr[8].v, "value": categoryArr[8].name },
            { "text": categoryArr[9].v, "value": categoryArr[9].name },
          ];
          let novelOption = [
            { "text": categoryArr[10].v, "value": categoryArr[10].name },
            { "text": categoryArr[11].v, "value": categoryArr[11].name },
            { "text": categoryArr[12].v, "value": categoryArr[12].name },
            { "text": categoryArr[13].v, "value": categoryArr[13].name },
            { "text": categoryArr[14].v, "value": categoryArr[14].name },
            { "text": categoryArr[15].v, "value": categoryArr[15].name },
            { "text": categoryArr[16].v, "value": categoryArr[16].name },
            { "text": categoryArr[17].v, "value": categoryArr[17].name },
            { "text": categoryArr[18].v, "value": categoryArr[18].name },
          ];
  
          // interactive message를 보내야 하기 때문에 value 변경 작업이 필요
          if (imageWordArr.includes(text.split('!책')[1].trim())) {
            bookOption.forEach((elem, idx) => {
              bookOption[idx].value = elem.value + 'Img';
            });
  
            novelOption.forEach((elem, idx) => {
              novelOption[idx].value = elem.value + 'Img';
            });
          }
          const selectCategory = {
            "type": "interactive_message",
            // "thread_ts": event.ts, // 사용성 저하
            "attachments": [
              {
                "text": bookInteractiveMessage,
                "mrkdwn_in": ["text"],
                "callback_id": actionId,
                "fallback": actionId + "Fail",
                "actions": [
                  {
                    "name": actionId,
                    "type": "select",
                    "option_groups": [
                      {
                        "text": "책",
                        "options": bookOption
                      },
                      {
                        "text": "소설",
                        "options": novelOption
                      }
                    ]
                  }
                ]
              }
            ],
          };
  
          fetch(slackWebHookUrl, {
            method: 'POST',
            body: JSON.stringify(selectCategory),
            headers: { 'Content-Type': 'application/json' },
          })
          .then(res => {
            if (!res.ok) {
              throw new Error();
            }
          })
          .catch(async (err) => {
            throw new Error(err);
          });
        }
      } catch (err) {
        await rtm.sendMessage(errorMessage, event.channel);
      }
    } else {
      return ;
    }
  });
} catch (allErr) {

}

async function sendImage (result: Buffer) : Promise<void> {
  try {
    const form = new FormData();
    form.append('channels', channel);
    form.append('token', apiToken);
    form.append('filename', `hobby-info-image-${new Date().toISOString()}`);
    form.append('filetype', 'image/png');
    form.append('title', `hobby-info-image-${new Date().toISOString()}.png`);
    form.append('initial_comment', new Date().toISOString());
    form.append('file', result, {
      contentType: 'text/plain',
      filename: `hobby-info-image-${new Date().toISOString()}`,
    });

    fetch('https://slack.com/api/files.upload', {
      method: 'POST',
      body: form,
      headers: Object.assign(form.getHeaders(), { 'Content-Type': 'multipart/form-data' }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error();
      }
    })
    .catch(async (err) => {
      throw new Error(err);
    });
  } catch (err) {
    await rtm.sendMessage(`${errorMessage} during getting image!`, channel);
  }
}
