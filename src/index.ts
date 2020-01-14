import { RTMClient } from '@slack/rtm-api';
import * as os from 'os';

import config from './config';
import { scrapeMovieText } from './scrapeMovie';

const token: string = config.SLACK_BOT_TOKEN;
const rtm = new RTMClient(token);

(async () => {
  await rtm.start();
})();

rtm.on('message', async (event) => {
  const text = event.text;
  try {
    await rtm.sendMessage(`Hello <@${event.user}>!`, event.channel);
    if (text.includes('!영화')) {
      scrapeMovieText().then(async (movieInfo) => {
        const tempMovieInfo = movieInfo.split(os.EOL);
        if (movieInfo) {
          for (const str of tempMovieInfo.slice(0, tempMovieInfo.length -1)) {
            if (str) {
              await rtm.sendMessage(str, event.channel);
            }
          }
        } else {
          await rtm.sendMessage(`An error occurred during getting movie information!`, event.channel);
        }
      });
    } else if (text.includes('!책') || text.includes('!도서')) {
      
    } else {
      const reply = await rtm.sendMessage(`I can't understand what you said!`, event.channel);
    }
  } catch (error) {
    await rtm.sendMessage(`An error occurred`, event.channel);
  }
});