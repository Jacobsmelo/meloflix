import React from 'react'
import {Swiper, SwiperSlide} from 'swiper/react'
import '../index.css'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'

import { FreeMode, Pagination, Navigation } from 'swiper/modules'
import NavButtons from './NavButtons'



const Trend = ({trendM}) => {



   return (
      <section className='trending'>
         <h2>Trending Movies</h2>
         <div className='default-carousel' id="default-carousel" data-carousel="slide">
            <Swiper breakpoints=
            {{
               480: {
                  slidesPerView: 2,
                  spaceBetween: 20
               },
               700: {
                  slidesPerView: 3,
                  spaceBetween: 30,
               },
               1060: {
                  slidesPerView : 3,
                  spaceBetween : 20
               },
               1240: {
                  slidesPerView: 5,
                  spaceBetween: 40

               }

            }}
            freeMode={true}            
            pagination={{
               clickable: true
            }}
            modules={[FreeMode, Pagination, Navigation]}
            className='max-w-[90%] lg:max-w-80%]'
            >
               {trendM.map((movie, index) => (
                  <SwiperSlide key={movie.$id} className='item-slide group'>
                     
                        <p>{index + 1} </p>
                        <img className= "movie-img inset-0 bg-cover bg-center" src={movie.poster_url} alt={movie.title} />
                  </SwiperSlide> 
               ))}

               <NavButtons />
            </Swiper>
         
            
         </div>
      </section>
   );
};

export default Trend;


