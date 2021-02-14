import { fetch } from 'cheerio-httpcli';

export default async (): Promise<string> => {
  try {
    let movies: object[] = [];
    let tempTitle: string = '';
    let tempGenres: string[] = [];
    let tempDirectors: string[] = [];
    let tempActors: string[] = [];
  
    const MOVIE_URL = 'https://movie.naver.com';
    const res: any = await fetch(`${MOVIE_URL}/movie/running/current.nhn`);
    const $ = res.$;
  
    $('div.lst_wrap ul li').each((idx: number, elem: any) => {
      // always reult.length === 7
      if (idx >= 7) {
        return '';
      }
  
      tempTitle = $(elem).find('dt.tit a').text();
      if (tempTitle) {
        tempGenres = [];
        tempDirectors = [];
        tempActors = [];
  
        $(elem).find('dd dl.info_txt1 dd:first-of-type span.link_txt a').each((i: number) => {
          tempGenres.push($(i).text());
        });
  
        $(elem).find('dd dl.info_txt1 dd:nth-of-type(2) span.link_txt a').each((i: number) => {
          tempDirectors.push($(i).text());
        });
  
        $(elem).find('dd dl.info_txt1 dd:last-child span.link_txt a').each((i: number) => {
          tempActors.push($(i).text());
        });
  
        movies.push({
          title: tempTitle,
          rating: $(elem).find('span.num:nth-of-type(2)').text(),
          ratingPerson: $(elem).find('span.num2').text(),
          link: `${MOVIE_URL}${$(elem).find('div.thumb a').attr('href')}`,
          poster: $(elem).find('div.thumb a img').attr('src'),
          ticketRate: $(elem).find('dd.star dl.info_exp dd div span.num').text(),
          genre: tempGenres,
          director: tempDirectors,
          actors: tempActors
        });
      }
    });
  
    if (movies.length !== 7) {
      return '';
    }
  
    let result: string = '';
    movies.forEach((obj: any, idx: number) => {
      switch(idx + 1) {
        case 1: result += `1️⃣`; break;
        case 2: result += `2️⃣`; break;
        case 3: result += `3️⃣`; break;
        case 4: result += `4️⃣`; break;
        case 5: result += `5️⃣`; break;
        case 6: result += `6️⃣`; break;
        case 7: result += `7️⃣`; break;
      }
  
      result += ` <${obj['link']}|*${obj['title']}*> ⭐️${obj['rating']}(${obj['ratingPerson']})` + "\n";
      result += `📊 예매율 ${obj['ticketRate']}% \n`;
      if (obj['genre'].length) {
        result += `✨ 장르`+ "\n" + `${obj['genre']} \n`;
      }
      result += `🤷‍♀감독🤷‍♂` + "\n" + `${obj['director']} \n`;
      if (obj['actors']) {
        result += `🙆‍♂ 배우 🙆`+ "\n" + `${obj['actors']} \n`;
      }
      result += `<${obj['poster']}|${obj['title']} 포스터> \n`;
    });
    return result;
  } catch (err) {
    console.log(err);
    return '';
  }
};
