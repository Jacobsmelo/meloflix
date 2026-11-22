import React from 'react'
import { useSwiper } from 'swiper/react'
import {RxArrowLeft, RxArrowRight} from 'react-icons/rx'


const NavButtons = () => {

   const swiper = useSwiper();

   return (
      <div>
      <button type='button' className='prev-slide' onClick={() => swiper.slidePrev(1000)}><RxArrowLeft className='arrowL' /></button>
      <button type='button' className='next-slide group' onClick={() => swiper.slideNext(1000)}><RxArrowRight className='arrowR' /></button>    
                        

      </div>
   )
}

export default NavButtons
