import { createMessageAdapter } from '@slack/interactive-messages';

export default createMessageAdapter(process.env.SIGNING_TOKEN || '');
