import http from 'http';
import express from 'express';
import slackInteractions from './slackInteractions';
const { PORT } = process.env;

const app = express();

app.get('*', (req: any, res: any) => {});

app.post('/slack/actions', slackInteractions.expressMiddleware());

http.createServer(app).listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
