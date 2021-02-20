import { RTMClient } from '@slack/rtm-api';
import * as dotenv from 'dotenv';
dotenv.config();

const rtmClient = new RTMClient(process.env.ACCESS_TOKEN || '');

(async () => {
  await rtmClient.start();
})();

export default rtmClient;
