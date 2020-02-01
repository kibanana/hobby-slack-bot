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
exports.categoryArr = [
    {
        url: 'http://www.yes24.com/24/Category/More/001001046?ElemNo=104&ElemSeq=1',
        v: '소설/시/희곡',
        name: 'NovelPoemBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/More/001001025?ElemNo=104&ElemSeq=1',
        v: '경제 경영',
        name: 'EconomyBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/More/001001022?ElemNo=104&ElemSeq=1',
        v: '사회 정치',
        name: 'SocietyBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/More/001001047?ElemNo=104&ElemSeq=1',
        v: '에세이',
        name: 'EssayBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/More/001001009?ElemNo=104&ElemSeq=1',
        v: '여행',
        name: 'TravelBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/More/001001010?ElemNo=104&ElemSeq=1',
        v: '역사',
        name: 'HistoryBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/More/001001007?ElemNo=104&ElemSeq=1',
        v: '예술',
        name: 'ArtBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/More/001001026?ElemNo=104&ElemSeq=1',
        v: '자기계발',
        name: 'SelfImprovementBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/More/001001002?ElemNo=104&ElemSeq=1',
        v: '자연과학',
        name: 'ScienceBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/More/001001019?ElemNo=104&ElemSeq=1',
        v: '인문',
        name: 'HumanitiesBest',
    },
    {
        url: 'http://www.yes24.com/24/Category/Display/001001046001',
        v: '한국소설',
        name: 'KoreanNovel',
    },
    {
        url: 'http://www.yes24.com/24/Category/Display/001001046002',
        v: '영미소설',
        name: 'EngNovel',
    },
    {
        url: 'http://www.yes24.com/24/Category/Display/001001046004',
        v: '중국소설',
        name: 'ChineseNovel',
    },
    {
        url: 'http://www.yes24.com/24/Category/Display/001001046005',
        v: '프랑스소설',
        name: 'FrenchNovel',
    },
    {
        url: 'http://www.yes24.com/24/Category/Display/001001046006',
        v: '독일소설',
        name: 'GermanNovel',
    },
    {
        url: 'http://www.yes24.com/24/Category/Display/001001046007',
        v: '러시아소설',
        name: 'RussianNovel',
    },
    {
        url: 'http://www.yes24.com/24/Category/Display/001001046008',
        v: '스페인/중남미소설',
        name: 'SpanishNovel',
    },
    {
        url: 'http://www.yes24.com/24/Category/Display/001001046009',
        v: '북유럽소설',
        name: 'EuropeNovel',
    },
    {
        url: 'http://www.yes24.com/24/Category/Display/001001046014',
        v: '시/희곡',
        name: 'Poem',
    },
];
exports.categoryNameArr = exports.categoryArr.map((item) => item.name);
exports.categoryUrlArr = exports.categoryArr.map((item) => item.url);
const scrapeBookText = (url) => __awaiter(void 0, void 0, void 0, function* () {
    let result = [];
    let bookTitle;
    yield cheerio_httpcli_1.fetch(url)
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
                }
                else {
                    throw new Error();
                }
            }
            catch (err) {
                return '';
            }
        });
    });
    if (result.length === 5) {
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
            }
            finalStr += ` <${obj['link']}|*${obj['title']}*> : ${obj['price']}원` + "\n";
            finalStr += `✒️ written by ${obj['author']}` + "\n";
            finalStr += `🏢 published by ${obj['publish']}` + "\n";
            finalStr += `${obj['summary'].trim()}` + "\n";
        });
        return finalStr;
    }
    else {
        return '';
    }
});
exports.scrapeBookText = scrapeBookText;
//# sourceMappingURL=scrapeBook.js.map