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
const puppeteer_1 = __importDefault(require("puppeteer"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("./config"));
const dotenv_1 = require("dotenv");
dotenv_1.config();
const scrapeBook_1 = require("./scrapeBook");
const s3 = new aws_sdk_1.default.S3();
const awsResion = process.env.AWS_REGION ? process.env.AWS_REGION : config_1.default.AWS_REGION;
const awsCredentials = process.env.AWS_IDENTITY ? process.env.AWS_IDENTITY : config_1.default.AWS_IDENTITY;
// Amazon Cognito 인증 공급자를 초기화합니다
aws_sdk_1.default.config.region = awsResion; // 리전
aws_sdk_1.default.config.credentials = new aws_sdk_1.default.CognitoIdentityCredentials({
    IdentityPoolId: awsCredentials
});
const getScreenshot = (URL) => __awaiter(void 0, void 0, void 0, function* () {
    let viewportHeight;
    let mainId;
    if (scrapeBook_1.categoryUrlArr.includes(URL)) {
        viewportHeight = 9000;
        mainId = '#category_layout';
    }
    else {
        viewportHeight = 1430;
        mainId = '#content';
    }
    const browser = yield puppeteer_1.default.launch();
    const page = yield browser.newPage();
    yield page.goto(URL, { waitUntil: 'networkidle2' });
    yield page.setViewport({
        width: 1280,
        height: viewportHeight,
    });
    const main = yield page.$(mainId);
    const mainResult = yield main.boundingBox();
    if (mainResult) {
        const screenshot = yield page.screenshot({
            encoding: "base64",
            type: 'png',
            clip: {
                x: mainResult.x,
                y: mainResult.y,
                width: Math.min(mainResult.width, page.viewport().width),
                height: Math.min(mainResult.height, page.viewport().height),
            },
        });
        yield browser.close();
        const buffer = Buffer.from(screenshot, "base64");
        return buffer;
    }
    return false;
});
exports.getScreenshot = getScreenshot;
const scrapeMovieImageWithAWS = (URL) => __awaiter(void 0, void 0, void 0, function* () {
    let result = '';
    const browser = yield puppeteer_1.default.launch();
    const page = yield browser.newPage();
    yield page.goto(URL, { waitUntil: 'networkidle2' });
    yield page.setViewport({
        width: 1280,
        height: 1430,
    });
    const main = yield page.$('#content');
    const mainResult = yield main.boundingBox();
    if (mainResult) {
        const screenshot = yield page.screenshot({
            // path: 'naverMovie.png',
            type: 'png',
            clip: {
                x: mainResult.x,
                y: mainResult.y,
                width: Math.min(mainResult.width, page.viewport().width),
                height: Math.min(mainResult.height, page.viewport().height),
            },
        });
        const bucket = "hobby-info-image";
        const key = `hobby-info-image-${Date.now().toString()}.png`;
        const s3Params = { Bucket: bucket, Key: key, Body: screenshot };
        result = yield s3.putObject(s3Params).promise()
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            delete s3Params.Body;
            return yield s3.getSignedUrlPromise('getObject', s3Params)
                .then((urlResult) => {
                return urlResult;
            })
                .catch((err) => {
                return '';
            });
        }))
            .catch((err) => {
            return '';
        });
    }
    yield browser.close();
    return result;
});
exports.scrapeMovieImageWithAWS = scrapeMovieImageWithAWS;
//# sourceMappingURL=getScreenshot.js.map