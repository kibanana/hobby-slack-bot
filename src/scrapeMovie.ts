import { fetch } from 'cheerio-httpcli';
import * as puppeteer from 'puppeteer';
import * as AWS from 'aws-sdk';
import config from './config';

const s3 = new AWS.S3();

// Amazon Cognito 인증 공급자를 초기화합니다
AWS.config.region = config.AWS_REGION; // 리전
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: config.AWS_IDENTITY,
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
          return true;
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
              link: `${MOVIE_URL}${$(elem).find('div.thumb a').attr('href')}`,
              poster: $(elem).find('div.thumb a img').attr('src'),
              ticketRate: $(elem).find('dd.star dl.info_exp dd div span.num').text(),
              genre: movieGenre,
              director: movieDirector,
              actors: movieActors,
            });
          }
        } catch (e) {
          return false;
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
        finalStr += ` ${obj['title']}` + "\n";
        finalStr += `📊 예매율 ${obj['ticketRate']}%` + "\n";
        if (obj['genre'].length) {
          finalStr += `✨ 장르`+ "\n" + `${obj['genre']}` + "\n";
        }
        finalStr += `🤷‍♀감독🤷‍♂` + "\n" + `${obj['director']}` + "\n";
        if (obj['actors']) {
          finalStr += `🙆‍♂ 배우 🙆`+ "\n" + `${obj['actors']}` + "\n";
        }
      });
      return finalStr;
    } else {
      return '';
    }
};

const scrapeMovieImage = async () => {
  let result = true;
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
    await s3.putObject(s3Params).promise();
    return '';
  } else {
    result = false;
  }

  await browser.close();
  return result;
};

export { scrapeMovieText, scrapeMovieImage };