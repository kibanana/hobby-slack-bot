"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_httpcli_1 = require("cheerio-httpcli");
const dotenv_1 = require("dotenv");
dotenv_1.config();
const scrapeMovieText = () => __awaiter(void 0, void 0, void 0, function* () {
    let result = [];
    const MOVIE_URL = 'https://movie.naver.com';
    yield cheerio_httpcli_1.fetch(MOVIE_URL + '/movie/running/current.nhn')
        .then((res) => {
        let movieTitle;
        let movieGenre = [];
        let movieDirector = [];
        let movieActors = [];
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
                }
                else {
                    throw new Error();
                }
            }
            catch (err) {
                return '';
            }
        });
    }); // then
    if (result.length === 7) {
        let finalStr = '';
        result.forEach((obj, idx) => {
            switch (idx + 1) {
                case 1:
                    finalStr += `1️⃣`;
                    break;
                case 2:
                    finalStr += `2️⃣`;
                    break;
                case 3:
                    finalStr += `3️⃣`;
                    break;
                case 4:
                    finalStr += `4️⃣`;
                    break;
                case 5:
                    finalStr += `5️⃣`;
                    break;
                case 6:
                    finalStr += `6️⃣`;
                    break;
                case 7:
                    finalStr += `7️⃣`;
                    break;
            }
            finalStr += ` <${obj['link']}|*${obj['title']}*> ⭐️${obj['rating']}(${obj['ratingPerson']})` + "\n";
            finalStr += `📊 예매율 ${obj['ticketRate']}%` + "\n";
            if (obj['genre'].length) {
                finalStr += `✨ 장르` + "\n" + `${obj['genre']}` + "\n";
            }
            finalStr += `🤷‍♀감독🤷‍♂` + "\n" + `${obj['director']}` + "\n";
            if (obj['actors']) {
                finalStr += `🙆‍♂ 배우 🙆` + "\n" + `${obj['actors']}` + "\n";
            }
            finalStr += `<${obj['poster']}|${obj['title']} 포스터>` + "\n";
        });
        return finalStr;
    }
    else {
        return '';
    }
});
exports.scrapeMovieText = scrapeMovieText;
//# sourceMappingURL=scrapeMovie.js.map