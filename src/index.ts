import http from 'http';
import express from 'express';
import fetch from 'node-fetch';
import { Respond } from '@slack/interactive-messages';
import rtmClient from './modules/rtmClient';
import slackInteractions from './modules/slackInteractions';
import scrapeMovie from './modules/scrapeMovie';
import scrapeBook from './modules/scrapeBook';
import getScreenshot from './modules/getScreenshot';
import sendImage from './modules/sendImage';
import CONSTANT from './modules/constants';
import MESSAGE from './modules/messages';
import ISelectPayload from './ts/ISelectPayload';
import * as dotenv from 'dotenv';
dotenv.config();
const { PORT, SLACK_WEBHOOK_URL } = process.env;

const app = express();

app.get('*', (req: any, res: any) => {});

app.post('/slack/actions', slackInteractions.expressMiddleware());

http.createServer(app).listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});

slackInteractions.action(CONSTANT.ACTION_ID, async (payload: ISelectPayload, respond: Respond) => {
  try {
    const categoryOption: string = payload.actions[0].selected_options['0']['value'];
    let categoryOptionIdx: number = 0;

    if (categoryOption.includes('Img')) {
      try {
        categoryOptionIdx = CONSTANT.CATEGORY_NAMES.indexOf(categoryOption.split('Img')[0].trim());

        respond({
          text: `*${CONSTANT.CATEGORYS[categoryOptionIdx].v}* 카테고리 선택`,
          response_type: 'in_channel'
        });
    
        const getScreenshotResult: Buffer | null = await getScreenshot(CONSTANT.CATEGORY_URLS[categoryOptionIdx]);
        if (!getScreenshotResult) {
          // TODO: error
        }

        await sendImage(getScreenshotResult);
      } catch (err) {
        await respond({
          text: `책 스크린샷을 가져오는 동안 ${MESSAGE.ERROR_MESSAGE}`,
          response_type: 'in_channel',
          replace_original: true
        });
      }
    }
    else {
      try {
        categoryOptionIdx = CONSTANT.CATEGORY_NAMES.indexOf(categoryOption.split('Img')[0].trim());

        respond({
          text: `*${CONSTANT.CATEGORYS[categoryOptionIdx].v}* 카테고리 선택`,
          response_type: 'in_channel'
        });
    
        const scrapeBookResult: string = await scrapeBook(CONSTANT.CATEGORY_URLS[categoryOptionIdx]);
        if (!scrapeBookResult) {
          // TODO: error
        }

        await respond({
          text: scrapeBookResult,
          response_type: 'in_channel',
          replace_original: true
        });
      } catch (err) {
        await respond({
          text: `책 정보를 가져오는 동안 ${MESSAGE.ERROR_MESSAGE}`,
          response_type: 'in_channel',
          replace_original: true
        });
      }
    }
  } catch (err) {
    // TODO: error
  }
});

rtmClient.on('message', async (event: { text: string; channel: string }) => {
  try {
    const text: string = event.text || '';
    if ((!text.trim()) || text.includes(MESSAGE.ERROR_MESSAGE) || text.includes(MESSAGE.BOOK_MARKDOWN_INTERACTIVE_MESSAGE) || text.includes(MESSAGE.BOOK_PLAIN_INTERACTIVE_MESSAGE)) {
      // TODO: error
    }

    // Bot에서 보낸 메시지도 event로 취급해서 무한루프 돌길래 if문으로 체크
    if (text.includes('!영화')) {
      if (CONSTANT.IMAGE_WORDS.includes(text.split('!영화')[1].trim())) {
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
          const getScreenshotResult: Buffer | null = await getScreenshot(MOVIE_URL);
          if (!getScreenshotResult) {
            // TODO: error
          }

          await sendImage(getScreenshotResult);
        } catch (err) {
          rtmClient.sendMessage(`영화 스크린샷을 가져오는 동안 ${MESSAGE.ERROR_MESSAGE}!`, event.channel);
        }
      } else { // text가 default
        try {
          const scrapeMovieResult: string = await scrapeMovie();
          if (!scrapeMovieResult) {
            // TODO: error
          }

          await rtmClient.sendMessage(scrapeMovieResult, event.channel);
        } catch (err) {
          await rtmClient.sendMessage(`영화 정보를 가져오는 동안 ${MESSAGE.ERROR_MESSAGE}!`, event.channel);
        }
      }
    } else if (text.includes('!책') || text.includes('!도서')) {
      // interactive message를 보내야 하기 때문에 value 변경 작업이 필요
      const copiedBookOptions = CONSTANT.BOOK_OPTIONS;
      const copiedNovelOptions = CONSTANT.NOVEL_OPTIONS;
      if (CONSTANT.IMAGE_WORDS.includes(text.split('!책')[1].trim())) {
        CONSTANT.BOOK_OPTIONS.forEach((elem, idx) => { copiedBookOptions[idx].value = `${elem.value}Img`; });
        CONSTANT.NOVEL_OPTIONS.forEach((elem, idx) => { copiedNovelOptions[idx].value = `${elem.value}Img`; });
      }

      const categorySelectionRequestBody = {
        "type": "interactive_message",
        // "thread_ts": event.ts, // 사용성 저하 문제
        "attachments": [
          {
            "text": MESSAGE.BOOK_MARKDOWN_INTERACTIVE_MESSAGE,
            "mrkdwn_in": ["text"],
            "callback_id": CONSTANT.ACTION_ID,
            "fallback": `${CONSTANT.ACTION_ID}Fail`,
            "actions": [
              {
                "name": CONSTANT.ACTION_ID,
                "type": "select",
                "option_groups": [
                  {
                    "text": "책",
                    "options": copiedBookOptions
                  },
                  {
                    "text": "소설",
                    "options": copiedNovelOptions
                  }
                ]
              }
            ]
          }
        ]
      };

      const res = await fetch(SLACK_WEBHOOK_URL || '', {
        method: 'POST',
        body: JSON.stringify(categorySelectionRequestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        // TODO: error
      }

      // TODO: 처리
    }
    else {
      // TODO: error
    }
  } catch (err) {
    console.log(err)
    await rtmClient.sendMessage(MESSAGE.ERROR_MESSAGE, event.channel);
    // TODO: error
  }
});
