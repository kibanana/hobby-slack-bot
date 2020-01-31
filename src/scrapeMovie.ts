import { fetch } from 'cheerio-httpcli';
import puppeteer from 'puppeteer';
import AWS from 'aws-sdk';

import configFile from './config';
import { config } from 'dotenv';

config();

const s3 = new AWS.S3();

const awsResion: string = process.env.AWS_REGION ? process.env.AWS_REGION : configFile.AWS_REGION;
const awsCredentials: string = process.env.AWS_IDENTITY ? process.env.AWS_IDENTITY : configFile.AWS_IDENTITY;

// Amazon Cognito 인증 공급자를 초기화합니다
AWS.config.region = awsResion // 리전
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: awsCredentials
});

const bucket = "hobby-info-image";
const key = `hobby-info-image-${Date.now().toString()}.png`;

const scrapeMovieText = async (): Promise<string> => {

  let result: object[] = [];

  const MOVIE_URL = 'https://movie.naver.com';

  await fetch(MOVIE_URL+'/movie/running/current.nhn')
    .then((res) => {
      let movieTitle: string;
      
      let movieGenre: string[] = [];
      let movieDirector: string[] = [];
      let movieActors: string[] = [];  
      
      const $ = res.$;

      $('div.lst_wrap ul li').each((i, elem) => {
        // always reult.length === 7
        if (i >= 7) {
          return '';
        }
  
        try {
          movieTitle = $(elem).find('dt.tit a').text();
          
          if (movieTitle) {
            movieGenre = [];
            movieDirector = [];
            movieActors = [];

            $(elem).find('dd dl.info_txt1 dd:first-of-type span.link_txt a').each((j, jElem) => {
              movieGenre.push($(jElem).text());
            });

            $(elem).find('dd dl.info_txt1 dd:nth-of-type(2) span.link_txt a').each((x, xElem) => {
              movieDirector.push($(xElem).text());
            });

            $(elem).find('dd dl.info_txt1 dd:last-child span.link_txt a').each((z, zElem) => {
              movieActors.push($(zElem).text());
            });

            result.push({
              title: movieTitle,
              rating: $(elem).find('span.num:nth-of-type(2)').text(),
              ratingPerson: $(elem).find('span.num2').text(),
              link: `${MOVIE_URL}${$(elem).find('div.thumb a').attr('href')}`,
              poster: $(elem).find('div.thumb a img').attr('src'),
              ticketRate: $(elem).find('dd.star dl.info_exp dd div span.num').text(),
              genre: movieGenre,
              director: movieDirector,
              actors: movieActors,
            });
          } else {
            throw new Error();
          }
        } catch (err) {
          return '';
        }
      });
    }); // then
    if (result.length === 7) {
      let finalStr: string = '';
      result.forEach((obj: any, idx: number) => { // title, ticketRate, genre, director, actors
        switch(idx + 1) {
          case 1: finalStr += `1️⃣`; break;
          case 2: finalStr += `2️⃣`; break;
          case 3: finalStr += `3️⃣`; break;
          case 4: finalStr += `4️⃣`; break;
          case 5: finalStr += `5️⃣`; break;
          case 6: finalStr += `6️⃣`; break;
          case 7: finalStr += `7️⃣`; break;
        }
        finalStr += ` <${obj['link']}|*${obj['title']}*> ⭐️${obj['rating']}(${obj['ratingPerson']})` + "\n";
        finalStr += `📊 예매율 ${obj['ticketRate']}%` + "\n";
        if (obj['genre'].length) {
          finalStr += `✨ 장르`+ "\n" + `${obj['genre']}` + "\n";
        }
        finalStr += `🤷‍♀감독🤷‍♂` + "\n" + `${obj['director']}` + "\n";
        if (obj['actors']) {
          finalStr += `🙆‍♂ 배우 🙆`+ "\n" + `${obj['actors']}` + "\n";
        }
        finalStr += `<${obj['poster']}|${obj['title']} 포스터>` + "\n";
      });
      return finalStr;
    } else {
      return '';
    }
};

const scrapeMovieImage = async () => {
  let result = '';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://movie.naver.com/movie/running/current.nhn#', { waitUntil: 'networkidle2' });
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

const scrapeMovieImageWithoutAWS = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://movie.naver.com/movie/running/current.nhn#', { waitUntil: 'networkidle2' });
  await page.setViewport({
    width: 1280,
    height: 1430,
  });

  const main = await page.$('#content');
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

export { scrapeMovieText, scrapeMovieImage, scrapeMovieImageWithoutAWS };
