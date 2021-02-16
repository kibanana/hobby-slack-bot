import fetch, { Response } from 'node-fetch';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';
import IBook from '../ts/IBook';

export default async (url: string): Promise<string> => {
  try {
    const books: IBook[] = [];
    let bookTitle: string;
    let bookAuthors: string[] = [];

    const res = await fetch(url);
    const $ = cheerio.load(iconv.decode((await res.buffer()), 'EUC-KR').toString());

    $('div#category_layout ul li div.goods_info').each((i: number, elem: any) => {
      // always reult.length === 5
      if (i >= 5) {
        return '';
      }
      
      bookAuthors = [];
      bookTitle = $(elem).find('div.goods_name a:nth-of-type(1)').text();
      if (bookTitle) {
        $(elem).find('div.goods_pubGrp span.goods_auth a').each((_: number, e: any) => {
          bookAuthors.push($(e).text());
        });
        
        books.push({
          title: bookTitle,
          author: bookAuthors,
          publish: $(elem).find('div.goods_pubGrp span.goods_pub').text(),
          price: $(elem).find('div.goods_price em:nth-of-type(1)').text(),
          summary: $(elem).find('div.goods_read').text(),
          link: `http://www.yes24.com/${$(elem).find('div.goods_name a:nth-of-type(1)').attr('href')}`,
        });
      }
    });

    if (books.length !== 5) {
      return '';
    }
    
    let result: string = '';
    books.forEach((book: IBook, idx: number) => {
      switch(idx + 1) {
        case 1: result += `1️⃣`; break;
        case 2: result += `2️⃣`; break;
        case 3: result += `3️⃣`; break;
        case 4: result += `4️⃣`; break;
        case 5: result += `5️⃣`; break;
      }
      
      result += ` <${book.link}|*${book.title}*> : ${book.price}원` + "\n";
      result += `✒️ written by ${book.author}` + "\n";
      result += `🏢 published by ${book.publish}` + "\n";
      result += `${(book.summary || '').trim()}` + "\n";
    });

    return result;
  } catch (err) {
    console.log(err);
    return '';
  }
};
