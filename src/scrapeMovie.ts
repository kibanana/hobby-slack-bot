import { fetch } from 'cheerio-httpcli';
import * as os from 'os';

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
      console.log(result);
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
        finalStr += ` ${obj['title']} ${os.EOL}`;
        finalStr += `📊 예매율 ${obj['ticketRate']}%${os.EOL}`;
        finalStr += `✨ 장르 ${os.EOL}${obj['genre']}${os.EOL}`;
        finalStr += `🤷‍♀감독🤷‍♂ ${os.EOL}${obj['director']}${os.EOL}`;
        finalStr += `🙆‍♂ 배우 🙆 ${os.EOL}${obj['actors']}${os.EOL}`;
      });
      return finalStr;
    } else {
      return '';
    }
};

export { scrapeMovieText };