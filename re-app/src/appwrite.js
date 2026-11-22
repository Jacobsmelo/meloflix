import { Client, Databases, Query, ID, TablesDB } from "appwrite"

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT
const API_KEY = import.meta.env.VITE_APPWRITE_API_KEY


const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const tablesDB = new TablesDB(client);


export const upSearchCount = async (searchTerm, movie) => {
   try {

      const result = await tablesDB.listRows({
         databaseId: DATABASE_ID,
         tableId: TABLE_ID,
         queries: [Query.equal('movie_Id', movie.id),]
      });
      
      console.log(result.total);

      if(result.total > 0) {
         
         const r_Id = result.rows[0].$id;
         console.log(result.rows[0].Count);

         const promise = await tablesDB.updateRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: r_Id,
            data: JSON.stringify({Count: result.rows[0].Count + 1})
         });
         console.log(promise.rows[0]);
         
      } else {

         await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: ID.unique(),
            data: JSON.stringify({
               searchTerm,
               Count: 1,
               poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
               movie_Id: movie.id,
            }),
         });
      }


   } catch (error) {
      console.error(error);
      
   }

}


export const getTrendMovies = async () => {
   try {
      const result = await tablesDB.listRows({
         databaseId: DATABASE_ID,
         tableId: TABLE_ID,
         queries: [
            Query.limit(10),
            Query.orderDesc("Count"),
         ],
      });
      console.log(result.rows)

      return result;
      
   } catch (error) {
      console.error(error);
      

   }
}