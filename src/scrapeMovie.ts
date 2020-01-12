import { fetch } from 'cheerio-httpcli';

const scrapeMovieText = async (): Promise<object[]> => {

  let result: object[] = [];

  await fetch('https://movie.naver.com/movie/running/current.nhn')
    .then((res) => {
      let movieTitle: string;
      
      let movieGenre: string[] = [];
      let movieDirector: string[] = [];
      let movieActors: string[] = [];  
      
      const $ = res.$;

      $('dl.lst_dsc').each((i, elem) => {
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
      return result;
    } else {
      return [{}];
    }
};

export { scrapeMovieText };