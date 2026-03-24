import {useState, useEffect} from 'react';
import { useDebounce} from 'react-use';
import './index.css';
import Search from './components/Search.jsx';
import Spinner  from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import { getTrendMovies, upSearchCount } from './appwrite.js';
import Trend from './components/Swip.jsx';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
   method : 'GET',
   headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
   }
}



const App = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [errorMessage, setErrorMessage] = useState('');
   const [moviesL, setmoviesL] = useState([]);
   const [isLoad, setisLoad] = useState(false);
   const [dbcdsearchT, setdbcdsearchT] = useState('');
   const [trendM, setTrendM] = useState([]);



   useDebounce( () => setdbcdsearchT(searchTerm), 3000, [searchTerm]);

   const fetchMovies = async (query = "") => {
      setisLoad(true);
      setErrorMessage('');
      try {
         const endpoint = query
         ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
         : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

         const response = await fetch(endpoint, API_OPTIONS);
         if(!response.ok){
            throw new Error('Failed to fetch movies');
         }
         const data = await response.json();
         
         if(data.Response === 'False') {
            setErrorMessage(data.Error || 'Failed to fetch movies');
            setmoviesL([]);
            return;
         }

         data.results.sort((a, b) => b.release_date.split('-')[0] - a.release_date.split('-')[0]);
         setmoviesL(data.results || []); 
         

         if(query && data.results.length > 0) {
            await upSearchCount(query, data.results[0]);
         }


      } catch(error) {
         console.error(`Error fetching movies: ${error}`)
         setErrorMessage('Error Fetching Movies Please try again later.')
      } finally {
         setisLoad(false);
      }
   }

   const loadTrendM = async () => {
      try {
         const movies = await getTrendMovies();

         setTrendM(movies.rows );

         
      } catch(error) {
         console.error(`Error fetching trending movies: ${error}`)
         
      }
   }
   console.log(trendM);

   useEffect(()=>{
      fetchMovies(dbcdsearchT);
   }, [dbcdsearchT]);

   useEffect(() =>{
      loadTrendM();
   }, []);

   // const swiper = new Swiper(".multiple-slide-carousel", {
   //    loop: true,
   //    slidesPerView: 3,
   //    spaceBetween: 2,
   //    navigation: {
   //    nextEl: ".multiple-slide-carousel .swiper-button-next",
   //    prevEl: ".multiple-slide-carousel .swiper-button-prev",
   //    },
   //    breakpoints: {
   //    1920: {
   //       slidesPerView: 3,
   //       spaceBetween: 30
   //    },
   //    1028: {
   //       slidesPerView: 2,
   //       spaceBetween: 30
   //    },
   //    990: {
   //       slidesPerView: 4,
   //       spaceBetween: 0
   //    }
   // }
   // });


   return (
      <main>
         <div className='pattern'/>
         <div className='wrapper'>
            <header>
               <img src="./hero-img.png" alt="Hero Image"/>
               <h1>Find <span className='text-gradient'>Movies</span> You'll love</h1>
            

               <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
               
            </header>

            {trendM.length > 0 && (
               <Trend trendM={trendM}/>

            )}
            <section className='all-movies'>
               <h2 className='hdtext '> All Movies</h2>
               
               {isLoad? (
                  <Spinner />
               ): errorMessage ? (
                  <p className='text-red-500'>{errorMessage}</p>
               ): (
                  <ul>
                     {moviesL.map((movie) => (
                     <MovieCard key={movie.id} movie={movie} />
                     ))}
                  </ul>
               ) }

            </section>
         </div>
      </main>
   )
}

export default App
