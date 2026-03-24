import React from 'react'





const MovieCard = ({movie:{ title, vote_average, poster_path, release_date, original_language} }) => {
   
   
   
   return (

      <figure className="movie-card" >
         <a class="group" href="#">
            <img class="group-hover:blur"className='movie-img' src={poster_path? `https://image.tmdb.org/t/p/w500/${poster_path}`: '/no-poster.png'} 
               alt={title}></img>
            <figcaption className='details ' class='details group-hover:opacity-100'>
               <h3 className='title'>{title}</h3>
               <div className='content'>
                  <div className='rating'>
                     <img className='star' src="star.svg" alt='StarIcon' />
                     <p className='text-white'>{vote_average? vote_average.toFixed(1): 'N/A'}</p>
                  </div>
                  {/* <span>•</span> */}
                  <p className='lang'>{original_language}</p>
                  {/* <span>•</span> */}
                  <p className='year'>
                     {release_date? release_date.split('-')[0]: 'N/A'}
                  </p>
               </div>
            </figcaption>
         </a>
         
         
      </figure>
   )
}

   export default MovieCard;
   
   