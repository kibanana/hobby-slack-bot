import { RTMClient } from '@slack/rtm-api';
import * as dotenv from 'dotenv';
dotenv.config();
const { ACCESS_TOKEN } = process.env;

const rtmClient = new RTMClient(ACCESS_TOKEN || '');

(async () => {
  await rtmClient.start();
})();

export default rtmClient;
