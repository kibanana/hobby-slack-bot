export default interface IMovie {
    title: string;
    rating?: string;
    ratingPerson?: string;
    link: string;
    poster?: string;
    ticketRate?: string;
    genre: string[];
    director: string[];
    actors: string[];
}