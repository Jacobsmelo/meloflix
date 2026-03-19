import React from 'react'

const Search = ({ searchTerm, setSearchTerm }) => {

   return (
      <div className="search">
         <div className='search-con'>
            <img className='img-search' src="search.svg" alt="search"/>
            <input className="inp" type="text" placeholder="Search here" value={searchTerm} 
            onChange={(event) => setSearchTerm(event.target.value)}/>
         </div>
      </div>
   )
}

export default Search
