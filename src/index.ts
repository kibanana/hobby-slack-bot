import { RTMClient } from '@slack/rtm-api';

import config from './config';
import { scrapeMovieText, scrapeMovieImage } from './scrapeMovie';

const token: string = config.SLACK_BOT_TOKEN;
const rtm = new RTMClient(token);

(async () => {
  await rtm.start();
})();

rtm.on('message', async (event) => {
  const text = event.text;

  // image send 후 사용자가 별다른 메시지를 보내지 않아도
  // Event가 발생해서 무한루프가 돌길래 if문으로 체크해서 종료
  if (!text) {
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
    } else if (text.includes('!책') || text.includes('!도서')) {
      
    } else {
      const reply = await rtm.sendMessage(`I can't understand what you said!`, event.channel);
    }
  } catch (error) {
    await rtm.sendMessage(`An error occurred`, event.channel);
  }
});