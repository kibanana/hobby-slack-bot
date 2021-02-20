import puppeteer from 'puppeteer';
import AWS from 'aws-sdk';
import CONSTANT from './constants';

const s3 = new AWS.S3();
AWS.config.region = process.env.AWS_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: process.env.AWS_IDENTITY || ''});

export default async (URL: string): Promise<Buffer | null> => {
  try {
    let viewportHeight: number;
    let id: string;
    
    if (CONSTANT.CATEGORY_URLS.includes(URL)) {
      viewportHeight = 9000;
      id = '#category_layout';
    } else {
      viewportHeight = 1430;
      id = '#content';
    }
  
    const browser = await puppeteer.launch(
      {
        'args' : [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      }
    );
    
    const page = await browser.newPage();
    // page.setDefaultNavigationTimeout(100000); // 0으로 하면 아무 에러도 안나서 더 불편함
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await page.setViewport({ width: 1280, height: viewportHeight });
  
    const main = await page.$(id);
    const mainResult = await main!.boundingBox();
    if (!mainResult) {
      return null;
    }
  
    const screenshot = await page.screenshot({
      encoding: 'base64',
      type: 'png',
      clip: {
        x: mainResult.x,
        y: mainResult.y,
        width: Math.min(mainResult.width, page.viewport().width),
        height: Math.min(mainResult.height, page.viewport().height),
      }, 
    }) as string;
    
    await browser.close();

    return Buffer.from(screenshot, "base64");
  } catch (err) {
    console.log(err);
    return null;
  }
};

// const scrapeMovieImageWithAWS = async (URL: string) => {
//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 0 });
//     await page.setViewport({ width: 1280, height: 1430 });
  
//     const main = await page.$('#content');
//     const mainResult = await main!.boundingBox();
//     if (!mainResult) {
//       return null;
//     }
  
//     const screenshot = await page.screenshot({
//       type: 'png',
//       clip: {
//         x: mainResult.x,
//         y: mainResult.y,
//         width: Math.min(mainResult.width, page.viewport().width),
//         height: Math.min(mainResult.height, page.viewport().height),
//       }, 
//     });
  
//     const bucket = 'hobby-image';
//     const key = `hobby-image-${Date.now().toString()}.png`;
//     const s3Params = { Bucket: bucket, Key: key, Body: screenshot };
//     await s3.putObject(s3Params).promise();
//     const urlResult = await s3.getSignedUrlPromise('getObject', s3Params);
    
//     await browser.close();
    
//     return urlResult;
//   } catch (err) {
//     console.log(err);
//     return null;
//   }
// };
