import { fetch } from 'cheerio-httpcli';

const scrapeMovieText = async (): Promise<object[]> => {

  let result: object[] = [];

  await fetch('https://movie.naver.com/movie/running/current.nhn')
    .then((res) => {
      let movieTitle: string;
      const $ = res.$;

      $('dl.lst_dsc').each((i, elem) => {
        // always reult.length === 7
        if (i >= 7) {
          return true;
        }
  
        try {
          movieTitle = $(elem).find('dt.tit a').text();
          if (movieTitle) {
            result.push({
              title: movieTitle,
              ticketRate: $(elem).find('dd.star dl.info_exp dd div span.num').text(),
              genre: $(elem).find('dd dl.info_txt1 dd:first-of-type span.link_txt a').text(),
              director: $(elem).find('dd dl.info_txt1 dd:nth-of-type(2) span.link_txt a').text(),
              actors: $(elem).find('dd dl.info_txt1 dd:last-child span.link_txt a').text(),
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

  // fetch('https://movie.naver.com/movie/running/current.nhn', (err, $, res, body) => {
  //   let movieTitle: string;

  //   $('dl.lst_dsc').each((i, elem) => {
  //     // always reult.length === 7
  //     if (i >= 7) {
  //       return true;
  //     }

  //     try {
  //       movieTitle = $(elem).find('dt.tit a').text();
  //       if (movieTitle) {
  //         result.push({
  //           title: movieTitle,
  //           ticketRate: $(elem).find('dd.star dl.info_exp dd div span.num').text(),
  //           genre: $(elem).find('dd dl.info_txt1 dd:first-of-type span.link_txt a').text(),
  //           director: $(elem).find('dd dl.info_txt1 dd:nth-of-type(2) span.link_txt a').text(),
  //           actors: $(elem).find('dd dl.info_txt1 dd:last-child span.link_txt a').text(),
  //         });
  //       }
  //     } catch (e) {
  //       return false;
  //     }
  //   });
  // });
  
  // if (result.length === 7) {
  //   return result;
  // } else {
  //   return false;
  // }

};

export { scrapeMovieText };