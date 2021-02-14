const categories = [
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
    }
];

const bookOptions = [
  { "text": categories[0].v, "value": categories[0].name },
  { "text": categories[1].v, "value": categories[1].name },
  { "text": categories[2].v, "value": categories[2].name },
  { "text": categories[3].v, "value": categories[3].name },
  { "text": categories[4].v, "value": categories[4].name },
  { "text": categories[5].v, "value": categories[5].name },
  { "text": categories[6].v, "value": categories[6].name },
  { "text": categories[7].v, "value": categories[7].name },
  { "text": categories[8].v, "value": categories[8].name },
  { "text": categories[9].v, "value": categories[9].name },
];

const novelOptions = [
  { "text": categories[10].v, "value": categories[10].name },
  { "text": categories[11].v, "value": categories[11].name },
  { "text": categories[12].v, "value": categories[12].name },
  { "text": categories[13].v, "value": categories[13].name },
  { "text": categories[14].v, "value": categories[14].name },
  { "text": categories[15].v, "value": categories[15].name },
  { "text": categories[16].v, "value": categories[16].name },
  { "text": categories[17].v, "value": categories[17].name },
  { "text": categories[18].v, "value": categories[18].name },
];

export default {
    ACTION_ID: 'bookSelect',
    IMAGE_WORDS: ['이미지', '사진', '스크린샷', 'img', 'image', 'picture', 'screenshot'],
    CATEGORYS: categories,
    CATEGORY_NAMES: categories.map((category) => category.name),
    CATEGORY_URLS: categories.map((category) => category.url),
    BOOK_OPTIONS: bookOptions,
    NOVEL_OPTIONS: novelOptions
};
