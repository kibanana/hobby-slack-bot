import { RTMClient } from '@slack/rtm-api';
const { ACCESS_TOKEN } = process.env;

const rtmClient = new RTMClient(ACCESS_TOKEN || '');

(async () => {
  await rtmClient.start();
})();

export default rtmClient;
