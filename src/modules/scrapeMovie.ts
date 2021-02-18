import fetch from 'node-fetch';
import cheerio from 'cheerio';
import IMovie from '../ts/IMovie';

export default async (): Promise<string> => {
  try {
    const movies: IMovie[] = [];
    let tempTitle: string = '';
    let tempGenres: string[] = [];
    let tempDirectors: string[] = [];
    let tempActors: string[] = [];
  
    const MOVIE_URL = 'https://movie.naver.com';
    const res = await fetch(`${MOVIE_URL}/movie/running/current.nhn`);
    const $ = cheerio.load(await res.text());
  
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
  
        $(elem).find('dd dl.info_txt1 dd:first-of-type span.link_txt a').each((i: number, elem: any) => {
          tempGenres.push($(elem).text());
        });
  
        $(elem).find('dd dl.info_txt1 dd:nth-of-type(2) span.link_txt a').each((i: number, elem: any) => {
          tempDirectors.push($(elem).text());
        });
  
        $(elem).find('dd dl.info_txt1 dd:last-child span.link_txt a').each((i: number, elem: any) => {
          tempActors.push($(elem).text());
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
    movies.forEach((movie: IMovie, idx: number) => {
      switch(idx + 1) {
        case 1: result += `1️⃣`; break;
        case 2: result += `2️⃣`; break;
        case 3: result += `3️⃣`; break;
        case 4: result += `4️⃣`; break;
        case 5: result += `5️⃣`; break;
        case 6: result += `6️⃣`; break;
        case 7: result += `7️⃣`; break;
      }
  
      result += ` <${movie.link}|*${movie.title}*> ⭐️${movie.rating}(${movie.ratingPerson})` + "\n";
      result += `📊 예매율 ${movie.ticketRate}% \n`;
      if (movie.genre.length) {
        result += `✨ 장르`+ "\n" + `${movie.genre} \n`;
      }
      result += `🤷‍♀감독🤷‍♂` + "\n" + `${movie.director} \n`;
      if (movie.actors) {
        result += `🙆‍♂ 배우 🙆`+ "\n" + `${movie.actors} \n`;
      }
      result += `<${movie.poster}|${movie.title} 포스터> \n`;
    });
    return result;
  } catch (err) {
    console.log(err);
    return '';
  }
};
