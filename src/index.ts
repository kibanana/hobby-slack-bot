import { RTMClient } from '@slack/rtm-api';
import { createMessageAdapter } from '@slack/interactive-messages';

import fetch from 'node-fetch';
import * as FormData from 'form-data';
import * as http from 'http';
import * as express from 'express';

import { scrapeMovieText, scrapeMovieImage, scrapeMovieImageWithoutAWS } from './scrapeMovie';
import { categoryArr, categoryNameArr, scrapeBookText, scrapeBookImage } from './scrapeBook';

import { config } from 'dotenv';
import configFile from './config';

config();

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

const signingToken: string = process.env.SIGNING_TOKEN ? process.env.SIGNING_TOKEN : configFile.SIGNING_TOKEN;
const apiToken: string = process.env.API_TOKEN ? process.env.API_TOKEN : configFile.API_TOKEN;
const token: string = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : configFile.ACCESS_TOKEN;
const port: number = process.env.PORT ? Number(process.env.PORT) : configFile.PORT;
const channel: string = process.env.CHANNEL ? process.env.CHANNEL : configFile.CHANNEL;
const slackWebHookUrl = process.env.SLACK_WEBHOOK_URL ? process.env.SLACK_WEBHOOK_URL : configFile.SLACK_WEBHOOK_URL;
const actionId:string = 'bookSelect';
const errorMessage = "An error occurred";
const unrecogErrorMessage = "I can't understand what you said!";
const imageWordArr = ['이미지', '사진', '스크린샷', 'img', 'image', 'screenshot'];

const slackInteractions = createMessageAdapter(signingToken);

const app = express();

app.post('/slack/actions', slackInteractions.expressMiddleware());
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});

slackInteractions.action(actionId, async (payload: IselectPayload, respond: any) => {
  const categoryResult: string = payload.actions[0].selected_options['0']['value'];
  let categoryResultIdx: number;

  if (categoryResult.includes('Img')) {
    categoryResultIdx = categoryNameArr.indexOf(categoryResult.split('Img')[0].trim());
  } else {
    categoryResultIdx = categoryNameArr.indexOf(categoryResult);
  }
  
  if (categoryResult.includes('Img')) {
    await scrapeBookImage(categoryArr[categoryResultIdx].url).then(async (result) => {
      if (!result) {
        await rtm.sendMessage(`${errorMessage} during getting image!`, channel);
        return ;
      } else {
        try {
          const form = new FormData();
          form.append('channels', channel);
          form.append('token', apiToken);
          form.append('filename', `hobby-info-image-${Date.now()}`);
          form.append('filetype', 'image/png');
          form.append('title', `hobby-info-image-${Date.now()}.png`);
          form.append('initial_comment', Date.now());
          form.append('file', result, {
            contentType: 'text/plain',
            filename: `hobby-info-image-${Date.now()}`,
          });

          fetch('https://slack.com/api/files.upload', {
            method: 'POST',
            body: form,
            headers: Object.assign(form.getHeaders(), { 'Content-Type': 'multipart/form-data' }),
          })
          .then(res => res.text())
          .then(body => {
            console.log(body);
          })
          .catch(async (err) => {
            await rtm.sendMessage(`${errorMessage} during getting image!`, channel);
          });
        } catch (err) {
          console.log(err);
        }
      }
    });
  } else {
    scrapeBookText(categoryArr[categoryResultIdx].url).then(async (bookInfo) => {
      if (bookInfo) {
        await rtm.sendMessage(bookInfo, channel);
      } else {
        await rtm.sendMessage(`${errorMessage} during getting book information!`, channel);
        return ;
      }
    });
  }
  await respond({
    text: `*${categoryArr[categoryResultIdx].v}* 카테고리 선택`,
    response_type: 'in_channel',
    replace_original: true
  });
});

const rtm = new RTMClient(token);

(async () => {
  await rtm.start();
})();

rtm.on('message', async (event) => {
  const text: string = event.text ? event.text : ' ';

  // event.channel === channel

  // image send 후 사용자가 별다른 메시지를 보내지 않아도
  // Event가 발생해서 무한루프가 돌길래 if문으로 체크해서 종료
  if (!((!text.trim()) || text.includes(errorMessage) || text.includes(unrecogErrorMessage) || text.includes('Hello'))) {
    try {
      // await rtm.sendMessage(`Hello <@${event.user}>!`, channel);
      if (text.includes('!영화')) {
        if (imageWordArr.includes(text.split('!영화')[1].trim())) {
          // await scrapeMovieImage().then(async (result) => {
          //   if (result) {
          //     await rtm.sendMessage(`<${result}|Movie Image>`, channel);
          //   } else {
          //     await rtm.sendMessage(`${errorMessage} during getting movie image!`, channel);
          //     return ;
          //   }
          // });
          await scrapeMovieImageWithoutAWS().then(async (result) => {
            if (!result) {
              await rtm.sendMessage(`${errorMessage} during getting image!`, channel);
              return ;
            } else {
              try {
                const form = new FormData();
                form.append('channels', channel);
                form.append('token', apiToken);
                form.append('filename', `hobby-info-image-${Date.now()}`);
                form.append('filetype', 'image/png');
                form.append('title', `hobby-info-image-${Date.now()}.png`);
                form.append('initial_comment', Date.now());
                form.append('file', result, {
                  contentType: 'text/plain',
                  filename: `hobby-info-image-${Date.now()}`,
                });

                fetch('https://slack.com/api/files.upload', {
                  method: 'POST',
                  body: form,
                  headers: Object.assign(form.getHeaders(), { 'Content-Type': 'multipart/form-data' }),
                })
                .then(res => res.text())
                .then(body => {
                  console.log(body);
                })
                .catch(async (err) => {
                  await rtm.sendMessage(`${errorMessage} during getting image!`, channel);
                });
              } catch (err) {
                console.log(err);
              }
            }
          });
        } else { // text가 default
          scrapeMovieText().then(async (movieInfo) => {
            if (movieInfo) {
              await rtm.sendMessage(movieInfo, channel);
            } else {
              await rtm.sendMessage(`${errorMessage} during getting movie information!`, channel);
              return ;
            }
          });
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

        // 한 번 interactive message를 보내야 하기 때문에 value 변경 작업이 필요하다
        if (imageWordArr.includes(text.split('!책')[1].trim())) {
          bookOption.forEach((elem, idx) => {
            bookOption[idx].value = elem.value + 'Img';
          });

          novelOption.forEach((elem, idx) => {
            novelOption[idx].value = elem.value + 'Img';
          });
        }
        // const confirmObj = {
        //   "title": "Are you sure?",
        //   "text": "Wouldn\'t you prefer other category?",
        //   "ok_text": "Yes",
        //   "dismiss_text": "No"
        // };
        const selectCategory = {
          "type": "interactive_message",
          // "thread_ts": event.ts, // 사용성 저하 우려
          "attachments": [
            {
              "text": "어떤 *책* 의 순위를 보고 싶으신가요?",
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
        .then(res => res.text())
        .then(body => {})
        .catch(async (err) => {
          await rtm.sendMessage(unrecogErrorMessage, channel);
        });
      } else {
        if ((!text.trim()) || text.includes(errorMessage) || text.includes(unrecogErrorMessage) || text.includes('Hello')) {
          await rtm.sendMessage(unrecogErrorMessage, channel);
          return ;
        }
      }
    } catch (error) {
      if ((!text.trim()) || text.includes(errorMessage) || text.includes(unrecogErrorMessage) || text.includes('Hello')) {
        await rtm.sendMessage(errorMessage, channel);
        return ;
      }
    }
  } else {
    return ;
  }
});