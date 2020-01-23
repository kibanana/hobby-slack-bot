import { fetch } from 'cheerio-httpcli';
import * as puppeteer from 'puppeteer';

export const urlNovelPoemBest = {
  url: 'http://www.yes24.com/24/Category/More/001001046?ElemNo=104&ElemSeq=1',
  v: '소설/시/희곡'
};
export const urlEconomyBest = {
  url: 'http://www.yes24.com/24/Category/More/001001025?ElemNo=104&ElemSeq=1',
  v: '경제 경영'
};
export const urlSocietyBest = {
  url: 'http://www.yes24.com/24/Category/More/001001022?ElemNo=104&ElemSeq=1',
  v: '사회 정치'
};
export const urlEssayBest = {
  url: 'http://www.yes24.com/24/Category/More/001001047?ElemNo=104&ElemSeq=1',
  v: '에세이'
};
export const urlTravelBest = {
  url: 'http://www.yes24.com/24/Category/More/001001009?ElemNo=104&ElemSeq=1',
  v: '여행'
};
export const urlHistoryBest = {
  url: 'http://www.yes24.com/24/Category/More/001001010?ElemNo=104&ElemSeq=1',
  v: '역사'
};
export const urlArtBest = {
  url: 'http://www.yes24.com/24/Category/More/001001007?ElemNo=104&ElemSeq=1',
  v: '예술'
};
export const urlSelfImprovementBest = {
  url: 'http://www.yes24.com/24/Category/More/001001026?ElemNo=104&ElemSeq=1',
  v: '자기계발'
};
export const urlScienceBest = {
  url: 'http://www.yes24.com/24/Category/More/001001002?ElemNo=104&ElemSeq=1',
  v: '자연과학'
};
export const urlHumanitiesBest = {
  url: 'http://www.yes24.com/24/Category/More/001001019?ElemNo=104&ElemSeq=1',
  v: '인문'
};

export const urlKoreanNovel = {
  url: 'http://www.yes24.com/24/Category/Display/001001046001',
  v: '한국소설'
};
export const urlEngNovel = {
  url: 'http://www.yes24.com/24/Category/Display/001001046002',
  v: '영미소설'
};
export const urlChineseNovel = {
  url: 'http://www.yes24.com/24/Category/Display/001001046004',
  v: '중국소설'
};
export const urlFrenchNovel = {
  url: 'http://www.yes24.com/24/Category/Display/001001046005',
  v: '프랑스소설'
};
export const urlGermanNovel = {
  url: 'http://www.yes24.com/24/Category/Display/001001046006',
  v: '독일소설'
};
export const urlRussianNovel = {
  url: 'http://www.yes24.com/24/Category/Display/001001046007',
  v: '러시아소설'
};
export const urlSpanishNovel = {
  url: 'http://www.yes24.com/24/Category/Display/001001046008',
  v: '스페인/중남미소설'
};
export const urlEuropeNovel = {
  url: 'http://www.yes24.com/24/Category/Display/001001046009',
  v: '북유럽소설'
};
export const urlPoem = {
  url: 'http://www.yes24.com/24/Category/Display/001001046014',
  v: '시/희곡'
};

const scrapeBookText = async (url: string) => {
  let result: object[] = [];
  let bookTitle: string;

  await fetch(url)
    .then((res) => {
      const $ = res.$;
      $('div#category_layout ul li div.goods_info').each((i, elem) => {
        // always reult.length === 5
        if (i >= 5) {
          return '';
        }

        try {
          bookTitle = $(elem).find('div.goods_name a:nth-of-type(1)').text();

          if (bookTitle) {
            result.push({
              title: bookTitle,
              author: $(elem).find('div.goods_pubGrp span.goods_auth a').text(),
              publish: $(elem).find('div.goods_pubGrp span.goods_pub').text(),
              price: $(elem).find('div.goods_price em:nth-of-type(1)').text(),
              summary: $(elem).find('div.goods_read').text(),
              link: 'http://www.yes24.com/' + $(elem).find('div.goods_name a:nth-of-type(1)').attr('href'),
            });
          } else {
            throw new Error();
          }
        } catch (err) {
          return '';
        }
      });
    });

  if (result.length === 5) {
    let finalStr: string = '';
      result.forEach((obj: any, idx: number) => { // title, ticketRate, genre, director, actors
        switch(idx + 1) {
          case 1: finalStr += `1️⃣`; break;
          case 2: finalStr += `2️⃣`; break;
          case 3: finalStr += `3️⃣`; break;
          case 4: finalStr += `4️⃣`; break;
          case 5: finalStr += `5️⃣`; break;
        }
        
        finalStr += ` <${obj['link']}|*${obj['title']}*> : ${obj['price']}원` + "\n";
        finalStr += `✒️ written by ${obj['author']}` + "\n";
        finalStr += `🏢 published by ${obj['publish']}` + "\n";
        finalStr += `${obj['summary'].trim()}` + "\n";
      });
      return finalStr;
  } else {
    return '';
  }
};

export { scrapeBookText };