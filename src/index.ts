import http from 'http';
import express from 'express';
import fetch from 'node-fetch';
import { Respond } from '@slack/interactive-messages';
import morgan from 'morgan';
import { logger, stream } from './modules/logger';
import logTypes from './modules/logTypes';
import rtmClient from './modules/rtmClient';
import { createMessageAdapter } from '@slack/interactive-messages';
import scrapeMovie from './modules/scrapeMovie';
import scrapeBook from './modules/scrapeBook';
import getScreenshot from './modules/getScreenshot';
import sendImage from './modules/sendImage';
import CONSTANT from './modules/constants';
import MESSAGE from './modules/messages';
import Payload from './ts/Payload';
import * as dotenv from 'dotenv';
dotenv.config();

const slackInteractions = createMessageAdapter(process.env.SIGNING_TOKEN || '');
const app = express();
app.use(morgan('combined', { stream })); // 책 카테고리
app.get('*', (req, res) => { res.send('success!'); });
app.post('/slack/actions', slackInteractions.requestListener());
http.createServer(app).listen(process.env.PORT || 3000, () => {
  console.log(`server listening on port ${process.env.PORT || 3000}`);
});

let channel: string | null = null;

slackInteractions.action(CONSTANT.ACTION_ID, async (payload: Payload, respond: Respond) => {
  try {
    const categoryOption = payload.actions[0].selected_options['0']['value'];
    let categoryOptionIdx: number = 0;

    if (categoryOption.includes('Img')) {
      try {
        categoryOptionIdx = CONSTANT.CATEGORY_NAMES.indexOf(categoryOption.split('Img')[0].trim());

        await respond({
          text: `*${CONSTANT.CATEGORYS[categoryOptionIdx].v}* 카테고리 선택`,
          response_type: 'in_channel'
        });
    
        const getScreenshotResult = await getScreenshot(CONSTANT.CATEGORY_URLS[categoryOptionIdx]);
        if (!getScreenshotResult) {
          return logger.log(logTypes.ERROR_GET_SCREENSHOT);
        }

        await sendImage(channel, getScreenshotResult);
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

        await respond({
          text: `*${CONSTANT.CATEGORYS[categoryOptionIdx].v}* 카테고리 선택`,
          response_type: 'in_channel'
        });
    
        const scrapeBookResult = await scrapeBook(CONSTANT.CATEGORY_URLS[categoryOptionIdx]);
        if (!scrapeBookResult) {
          return logger.log(logTypes.ERROR_GET_BOOK);
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
    logger.log({ level: 'error', message: 'slackInteractions error!' });
  }
});

rtmClient.on('message', async (event: { text: string; channel: string }) => {
  try {
    channel = event.channel;
    const { text } = event;
    if (!text || !text.trim() || text.includes(MESSAGE.ERROR_MESSAGE) || text.includes(MESSAGE.BOOK_MARKDOWN_INTERACTIVE_MESSAGE) || text.includes(MESSAGE.BOOK_PLAIN_INTERACTIVE_MESSAGE)) {
      return logger.log(logTypes.ERROR_BOT_MESSAGE);
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
          const getScreenshotResult = await getScreenshot(MOVIE_URL);
          if (!getScreenshotResult) {
            return logger.log(logTypes.ERROR_GET_SCREENSHOT);
          }

          await sendImage(event.channel, getScreenshotResult);
        } catch (err) {
          rtmClient.sendMessage(`영화 스크린샷을 가져오는 동안 ${MESSAGE.ERROR_MESSAGE}!`, event.channel);
        }
      } else { // text가 default
        try {
          const scrapeMovieResult = await scrapeMovie();
          if (!scrapeMovieResult) {
            return logger.log(logTypes.ERROR_GET_MOVIE);
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

      let word: string = '';
      if (text.includes('!책')) {
        word = text.split('!책')[1].trim();
      } else if (text.includes('!도서')) {
        word = text.split('!도서')[1].trim();
      }
  
      if (CONSTANT.IMAGE_WORDS.includes(word)) {
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

      try {
        const res = await fetch(process.env.SLACK_WEBHOOK_URL || '', {
          method: 'POST',
          body: JSON.stringify(categorySelectionRequestBody),
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          await rtmClient.sendMessage(`책 카테고리를 가져오는 동안 ${MESSAGE.ERROR_MESSAGE}!`, event.channel);
          return logger.log(logTypes.ERROR_WEBHOOK);
        }
      } catch (err) {
        return logger.log(logTypes.ERROR_WEBHOOK);
      }
    } else if (text.includes('!h')) {
      await rtmClient.sendMessage(MESSAGE.INSTRUCTION, event.channel);
    }
  } catch (err) {
    console.log(err);
    await rtmClient.sendMessage(MESSAGE.ERROR_MESSAGE, event.channel);
    logger.log({ level: 'error', message: 'rtmClient error!' });
  }
});
