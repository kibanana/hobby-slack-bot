"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rtm_api_1 = require("@slack/rtm-api");
const interactive_messages_1 = require("@slack/interactive-messages");
const node_fetch_1 = __importDefault(require("node-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const scrapeMovie_1 = require("./scrapeMovie");
const scrapeBook_1 = require("./scrapeBook");
const getScreenshot_1 = require("./getScreenshot");
const dotenv_1 = require("dotenv");
const config_1 = __importDefault(require("./config"));
dotenv_1.config();
const signingToken = process.env.SIGNING_TOKEN ? process.env.SIGNING_TOKEN : config_1.default.SIGNING_TOKEN;
const apiToken = process.env.API_TOKEN ? process.env.API_TOKEN : config_1.default.API_TOKEN;
const token = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : config_1.default.ACCESS_TOKEN;
const port = process.env.PORT ? Number(process.env.PORT) : config_1.default.PORT;
const channel = process.env.CHANNEL ? process.env.CHANNEL : config_1.default.CHANNEL;
const slackWebHookUrl = process.env.SLACK_WEBHOOK_URL ? process.env.SLACK_WEBHOOK_URL : config_1.default.SLACK_WEBHOOK_URL;
const actionId = 'bookSelect';
const errorMessage = "An error occurred";
const unrecogErrorMessage = "I can't understand what you said!";
const imageWordArr = ['이미지', '사진', '스크린샷', 'img', 'image', 'picture', 'screenshot'];
const slackInteractions = interactive_messages_1.createMessageAdapter(signingToken);
const app = express_1.default();
app.post('/slack/actions', slackInteractions.expressMiddleware());
http_1.default.createServer(app).listen(port, () => {
    console.log(`server listening on port ${port}`);
});
slackInteractions.action(actionId, (payload, respond) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryResult = payload.actions[0].selected_options['0']['value'];
    let categoryResultIdx = 0;
    let flag = true;
    if (categoryResult.includes('Img')) {
        categoryResultIdx = scrapeBook_1.categoryNameArr.indexOf(categoryResult.split('Img')[0].trim());
        try {
            yield getScreenshot_1.getScreenshot(scrapeBook_1.categoryArr[categoryResultIdx].url).then((result) => __awaiter(void 0, void 0, void 0, function* () {
                if (result) {
                    sendImage(result);
                }
                else {
                    throw new Error();
                }
            }));
        }
        catch (err) {
            flag = false;
            yield rtm.sendMessage(`${errorMessage} during getting book image!`, channel);
        }
    }
    else { // text가 default
        try {
            categoryResultIdx = scrapeBook_1.categoryNameArr.indexOf(categoryResult);
            scrapeBook_1.scrapeBookText(scrapeBook_1.categoryArr[categoryResultIdx].url).then((bookInfo) => __awaiter(void 0, void 0, void 0, function* () {
                if (bookInfo) {
                    yield rtm.sendMessage(bookInfo, channel);
                }
                else {
                    throw new Error();
                }
            }));
        }
        catch (err) {
            flag = false;
            yield rtm.sendMessage(`${errorMessage} during getting book information!`, channel);
        }
    }
    if (flag) {
        yield respond({
            text: `*${scrapeBook_1.categoryArr[categoryResultIdx].v}* 카테고리 선택`,
            response_type: 'in_channel',
            replace_original: true
        });
    }
}));
const rtm = new rtm_api_1.RTMClient(token);
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield rtm.start();
}))();
rtm.on('message', (event) => __awaiter(void 0, void 0, void 0, function* () {
    const text = event.text;
    // Bot에서 보낸 메시지도 event로 취급돼서 무한루프가 돌길래 if문으로 체크
    if (!((!text.trim()) || text.includes(errorMessage) || text.includes(unrecogErrorMessage) || text.includes('Hello'))) {
        try {
            // await rtm.sendMessage(`Hello <@${event.user}>!`, channel);
            if (text.includes('!영화')) {
                if (imageWordArr.includes(text.split('!영화')[1].trim())) {
                    const MOVIE_URL = 'https://movie.naver.com/movie/running/current.nhn#';
                    // await scrapeMovieImageWithAWS(MOVIE_URL).then(async (result) => {
                    //   if (result) {
                    //     await rtm.sendMessage(`<${result}|Movie Image>`, channel);
                    //   } else {
                    //     await rtm.sendMessage(`${errorMessage} during getting movie image!`, channel);
                    //     return ;
                    //   }
                    // });
                    try {
                        yield getScreenshot_1.getScreenshot(MOVIE_URL).then((result) => __awaiter(void 0, void 0, void 0, function* () {
                            if (result) {
                                sendImage(result);
                            }
                            else {
                                throw new Error();
                            }
                        }));
                    }
                    catch (err) {
                        yield rtm.sendMessage(`${errorMessage} during getting movie image!`, channel);
                    }
                }
                else { // text가 default
                    try {
                        scrapeMovie_1.scrapeMovieText().then((movieInfo) => __awaiter(void 0, void 0, void 0, function* () {
                            if (movieInfo) {
                                yield rtm.sendMessage(movieInfo, channel);
                            }
                            else {
                                throw new Error();
                            }
                        }));
                    }
                    catch (err) {
                        yield rtm.sendMessage(`${errorMessage} during getting movie information!`, channel);
                    }
                }
            }
            else if (text.includes('!책') || text.includes('!도서')) { // 책 1단계
                let bookOption = [
                    { "text": scrapeBook_1.categoryArr[0].v, "value": scrapeBook_1.categoryArr[0].name },
                    { "text": scrapeBook_1.categoryArr[1].v, "value": scrapeBook_1.categoryArr[1].name },
                    { "text": scrapeBook_1.categoryArr[2].v, "value": scrapeBook_1.categoryArr[2].name },
                    { "text": scrapeBook_1.categoryArr[3].v, "value": scrapeBook_1.categoryArr[3].name },
                    { "text": scrapeBook_1.categoryArr[4].v, "value": scrapeBook_1.categoryArr[4].name },
                    { "text": scrapeBook_1.categoryArr[5].v, "value": scrapeBook_1.categoryArr[5].name },
                    { "text": scrapeBook_1.categoryArr[6].v, "value": scrapeBook_1.categoryArr[6].name },
                    { "text": scrapeBook_1.categoryArr[7].v, "value": scrapeBook_1.categoryArr[7].name },
                    { "text": scrapeBook_1.categoryArr[8].v, "value": scrapeBook_1.categoryArr[8].name },
                    { "text": scrapeBook_1.categoryArr[9].v, "value": scrapeBook_1.categoryArr[9].name },
                ];
                let novelOption = [
                    { "text": scrapeBook_1.categoryArr[10].v, "value": scrapeBook_1.categoryArr[10].name },
                    { "text": scrapeBook_1.categoryArr[11].v, "value": scrapeBook_1.categoryArr[11].name },
                    { "text": scrapeBook_1.categoryArr[12].v, "value": scrapeBook_1.categoryArr[12].name },
                    { "text": scrapeBook_1.categoryArr[13].v, "value": scrapeBook_1.categoryArr[13].name },
                    { "text": scrapeBook_1.categoryArr[14].v, "value": scrapeBook_1.categoryArr[14].name },
                    { "text": scrapeBook_1.categoryArr[15].v, "value": scrapeBook_1.categoryArr[15].name },
                    { "text": scrapeBook_1.categoryArr[16].v, "value": scrapeBook_1.categoryArr[16].name },
                    { "text": scrapeBook_1.categoryArr[17].v, "value": scrapeBook_1.categoryArr[17].name },
                    { "text": scrapeBook_1.categoryArr[18].v, "value": scrapeBook_1.categoryArr[18].name },
                ];
                // interactive message를 보내야 하기 때문에 value 변경 작업이 필요
                if (imageWordArr.includes(text.split('!책')[1].trim())) {
                    bookOption.forEach((elem, idx) => {
                        bookOption[idx].value = elem.value + 'Img';
                    });
                    novelOption.forEach((elem, idx) => {
                        novelOption[idx].value = elem.value + 'Img';
                    });
                }
                const selectCategory = {
                    "type": "interactive_message",
                    // "thread_ts": event.ts, // 사용성 저하
                    "attachments": [
                        {
                            "text": "어떤 *책* 의 순위를 보고 싶으신가요?",
                            "mrkdwn_in": ["text"],
                            "callback_id": actionId,
                            "fallback": actionId + "Fail",
                            "actions": [
                                {
                                    "name": actionId,
                                    "type": "select",
                                    "option_groups": [
                                        {
                                            "text": "책",
                                            "options": bookOption
                                        },
                                        {
                                            "text": "소설",
                                            "options": novelOption
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                };
                node_fetch_1.default(slackWebHookUrl, {
                    method: 'POST',
                    body: JSON.stringify(selectCategory),
                    headers: { 'Content-Type': 'application/json' },
                })
                    .then(res => {
                    if (!res.ok) {
                        throw new Error();
                    }
                })
                    .catch((err) => __awaiter(void 0, void 0, void 0, function* () {
                    new Error();
                }));
            }
        }
        catch (err) {
            yield rtm.sendMessage(errorMessage, channel);
        }
    }
    else {
        yield rtm.sendMessage(unrecogErrorMessage, channel);
    }
}));
function sendImage(result) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const form = new form_data_1.default();
            form.append('channels', channel);
            form.append('token', apiToken);
            form.append('filename', `hobby-info-image-${new Date().toISOString()}`);
            form.append('filetype', 'image/png');
            form.append('title', `hobby-info-image-${new Date().toISOString()}.png`);
            form.append('initial_comment', new Date().toISOString());
            form.append('file', result, {
                contentType: 'text/plain',
                filename: `hobby-info-image-${new Date().toISOString()}`,
            });
            node_fetch_1.default('https://slack.com/api/files.upload', {
                method: 'POST',
                body: form,
                headers: Object.assign(form.getHeaders(), { 'Content-Type': 'multipart/form-data' }),
            })
                .then(res => {
                if (!res.ok) {
                    throw new Error();
                }
            })
                .catch((err) => __awaiter(this, void 0, void 0, function* () {
                throw new Error();
            }));
        }
        catch (err) {
            yield rtm.sendMessage(`${errorMessage} during getting image!`, channel);
        }
    });
}
//# sourceMappingURL=index.js.map