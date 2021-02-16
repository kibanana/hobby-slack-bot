import fetch, { Response } from 'node-fetch';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';

export default async (url: string): Promise<string> => {
  try {
    let result: object[] = [];
    let bookTitle: string;
    let bookAuthor: string[] = [];

    const res: Response = await fetch(url);
    
    const $: cheerio.Root = cheerio.load(iconv.decode((await res.buffer()), 'EUC-KR').toString());

    $('div#category_layout ul li div.goods_info').each((i: number, elem: any) => {
      // always reult.length === 5
      if (i >= 5) {
        return '';
      }
      
      bookAuthor = [];
      bookTitle = $(elem).find('div.goods_name a:nth-of-type(1)').text();
      if (bookTitle) {
        $(elem).find('div.goods_pubGrp span.goods_auth a').each((_: number, e: any) => {
          bookAuthor.push($(e).text());
        });
        
        result.push({
          title: bookTitle,
          author: bookAuthor,
          publish: $(elem).find('div.goods_pubGrp span.goods_pub').text(),
          price: $(elem).find('div.goods_price em:nth-of-type(1)').text(),
          summary: $(elem).find('div.goods_read').text(),
          link: `http://www.yes24.com/${$(elem).find('div.goods_name a:nth-of-type(1)').attr('href')}`,
        });
      }
    });

    if (result.length !== 5) {
      return '';
    }
    
    let resultStr: string = '';
    result.forEach((obj: any, idx: number) => {
      switch(idx + 1) {
        case 1: resultStr += `1️⃣`; break;
        case 2: resultStr += `2️⃣`; break;
        case 3: resultStr += `3️⃣`; break;
        case 4: resultStr += `4️⃣`; break;
        case 5: resultStr += `5️⃣`; break;
      }
      
      resultStr += ` <${obj['link']}|*${obj['title']}*> : ${obj['price']}원` + "\n";
      resultStr += `✒️ written by ${obj['author']}` + "\n";
      resultStr += `🏢 published by ${obj['publish']}` + "\n";
      resultStr += `${obj['summary'].trim()}` + "\n";
    });

    return resultStr;
  } catch (err) {
    console.log(err);
    return '';
  }
};
