import React from 'react'

const Search = ({ searchTerm, setSearchTerm }) => {

   return (
      <div className="search">
         <label for="Search" class="block search-block"></label>
         <div className='search-con'>
            <span class="search-icon">
               <img class="search-img" src="search.svg" />
               
            </span>
            <input id="Search" class="inp" type="text" placeholder="Search here" value={searchTerm} 
            onChange={(event) => setSearchTerm(event.target.value)}/>
         </div>
      </div>
      
   )
}

export default Search
