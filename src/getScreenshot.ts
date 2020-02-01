import puppeteer from 'puppeteer';
import AWS from 'aws-sdk';

import configFile from './config';
import { config } from 'dotenv';

config();

import { categoryUrlArr } from './scrapeBook';

const s3 = new AWS.S3();

const awsResion: string = process.env.AWS_REGION ? process.env.AWS_REGION : configFile.AWS_REGION;
const awsCredentials: string = process.env.AWS_IDENTITY ? process.env.AWS_IDENTITY : configFile.AWS_IDENTITY;

// Amazon Cognito 인증 공급자를 초기화합니다
AWS.config.region = awsResion // 리전
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: awsCredentials
});

const getScreenshot = async (URL: string) => {
  let viewportHeight: number;
  let mainId: string;
  if (categoryUrlArr.includes(URL)) {
    viewportHeight = 9000;
    mainId = '#category_layout';
  } else {
    viewportHeight = 1430;
    mainId = '#content';
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await page.setViewport({
    width: 1280,
    height: viewportHeight,
  });

  const main = await page.$(mainId);
  const mainResult = await main!.boundingBox();

  if (mainResult) {
    const screenshot: string = await page.screenshot({
      encoding: "base64",
      type: 'png',
      clip: {
        x: mainResult.x,
        y: mainResult.y,
        width: Math.min(mainResult.width, page.viewport().width),
        height: Math.min(mainResult.height, page.viewport().height),
      }, 
    }) as string;
    await browser.close();
    
    const buffer: Buffer = Buffer.from(screenshot, "base64");
    return buffer;
  } 
  return false;
};

const scrapeMovieImageWithAWS = async (URL: string) => {
  let result = '';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await page.setViewport({
    width: 1280,
    height: 1430,
  });

  const main = await page.$('#content');
  const mainResult = await main!.boundingBox();

  if (mainResult) {
    const screenshot = await page.screenshot({
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
    result = await s3.putObject(s3Params).promise()
      .then(async (result: any) => {
        delete s3Params.Body;
        return await s3.getSignedUrlPromise('getObject', s3Params)
          .then((urlResult) => {
            return urlResult;
          })
          .catch((err: Error) => {
            return '';
          });
      })
      .catch((err: Error) => {
        return '';
      });
  }

  await browser.close();
  return result;
};

export { getScreenshot, scrapeMovieImageWithAWS };
