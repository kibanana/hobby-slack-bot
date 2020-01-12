import { RTMClient } from '@slack/rtm-api';

import config from './config';

const token: string = config.SLACK_BOT_TOKEN;
const rtm = new RTMClient(token);

(async () => {
  await rtm.start();
})();

rtm.on('message', async (event) => {
  try {
    const reply = await rtm.sendMessage(`Hello <@${event.user}>! This is hobby-info-slack-bot`, event.channel);
  } catch (error) {
    await rtm.sendMessage(`An error occurred`, event.channel);
  }
});