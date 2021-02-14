import { createMessageAdapter } from '@slack/interactive-messages';
const { SIGNING_TOKEN } = process.env;

export default createMessageAdapter(SIGNING_TOKEN || '');
