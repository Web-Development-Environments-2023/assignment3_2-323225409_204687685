const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
// require('dotenv').config();



const MySql = require("../utils/MySql");
const DButils = require("../utils/DButils");
const user_utils = require("./user_utils");
const recipe_utils = require("./recipes_utils");


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
  console.log("im here")//get the recipes information from the spooncular api
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
            
           
        }
    });
} 



async function getRecipeDetails(recipe_id) {//returns only the info we need
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}




//_________________________________we added_________________________________________
//amount = user can choose how many recipes he will get back 15/10/5
//all search results must contain instructions
//search by: recipe name / food name + filter by lists that will be saved on client side
//cuisine , diet , intolerance - client side 
async function getSearchRecipe(query, amount, cuisine, diet, intolerance, sort) {
    let user_search_url= `${api_domain}/complexSearch/?`

    if(query !== undefined){
        user_search_url = search_url + `&query=${query}`
    }
    if(cuisine !== undefined){
        user_search_url = search_url + `&cuisine=${cuisine}`
    }
    if(diet !== undefined){
        user_search_url = search_url + `&diet=${diet}`
    }
    if(intolerance !== undefined){
        user_search_url = search_url + `&intolerance=${intolerance}`
    }

    if(sort !== undefined){
        user_search_url = search_url + `&sort=${sort}`
    }

    user_search_url = search_url + `&instructionsRequired=true&addRecipeInformation=true` 

    if(amount !== undefined){
        user_search_url = search_url + `&number=${amount}`
    }


    var http_response = await axios.get(user_search_url,{
        params: {
            number: 5,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return http_response.data;
}

async function getRecipesPreview(recipesIdsList, userId) {//gets the recipe preview
    const promises = recipesIdsList.map((id) => getRecipeInformation(id));
    const recipeInfoResponses = await Promise.all(promises);
    return getPreviewDetails(recipeInfoResponses, userId);
  }



// ___________________________________________

async function getTotalRecipeInfo(userId, recipeId) {

    let all_recipe_info = await getRecipeInformation(recipeId);
    console.log(all_recipe_info)

    let { //save from API all the needed info for the recipe 
        
          id,
          title,
          readyInMinutes,
          image,
          aggregateLikes,
          vegan,
          vegetarian,
          glutenFree,
          analyzedInstructions,
          extendedIngredients,
          servings,
        
      } = all_recipe_info.data;
      
    let recipe_ingredients_list = extendedIngredients.map(({ name, amount }) => ({ name, amount })); //append to the list all ingredients of the recipe and how much we need
    let if_recipe_exist_in_user_favorites = await  user_utils.checkIfFavorite(userId,id); //??????????????
    let if_recipe_watched_by_user =  await user_utils.checkIfWatched(userId,id); //??????????
    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        if_recipe_exist_in_user_favorites:if_recipe_exist_in_user_favorites, //???????
        if_recipe_watched_by_user:if_recipe_watched_by_user, //???????????????
        servings:servings,
        instructions: analyzedInstructions,
        extendedIngredients: recipe_ingredients_list
       
    }
}


//this func is for requirment 1
async function getPreviewDetails(recipesInfo,userId){//get the needed detailes for preview
    return await Promise.all(
        recipesInfo.map(async (recipeInfo) => {
          let data = recipeInfo;
          if (recipeInfo.data) {
            data = recipeInfo.data;
          }
          const { 
            id, 
            title, 
            readyInMinutes, 
            image, 
            aggregateLikes, 
            vegan, 
            vegetarian, 
            glutenFree, 
            servings 
          } = data;

          let if_recipe_exist_in_user_favorites = await user_utils.checkIfFavorite(userId, id);
          let if_recipe_watched_by_user = await user_utils.checkIfWatched(userId, id);
          return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            aggregateLikes: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            if_recipe_exist_in_user_favorites: if_recipe_exist_in_user_favorites,
            if_recipe_watched_by_user: if_recipe_watched_by_user,
            servings: servings,
          };
        })
      );
}


async function searchWithFilters(query, amount, cuisine, diet, intolerance, sort,userId,count){//make the search with user filters.
    const recipeCount = num || 5;
    let searchResults = await getRecipesFromSearch(query, amount, cuisine, diet, intolerance, sort);/////name
    let filteredSearchResults = searchResults.results.filter((result) => {
        return result.analyzedInstructions.length !== 0;
      });

    if (filteredSearchResults.length < amount - count && searchResults.totalResults >= amount) {
        counter++;
        return searchWithFilters(query, amount + 1, cuisine, diet, intolerance, sort, userId, count);
    }


    if (filteredResults.length < recipeCount - count && searchResults.totalResults >= recipeCount) {
        count++;
        return getFilteredSearchRecipes(
          query,
          recipeCount + 1,
          cuisine,
          diet,
          intolerance,
          sorting,
          sort,
          count
        );
      }
    return getPreviewDetails(filteredSearchResults, userId);


}

async function getRandomRecipes() {// returns 10 random recipes 
    const response = await axios.get(`${api_domain}/random`,{
        params: {
            number:10,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return response;
}

async function get3randomRecipe() {// gets the 10 random recipes and select the first 3 that meet the criterias
    const random_pool = await getRandomRecipes();
    const filtered_random_pool = random_pool.data.recipes.filter(
      (random) => random.instructions && random.image
    );
  
    if (filtered_random_pool.length < 3) {
      return getRandomThreeRecipes();
    }
  
    const preview_recipe_details = extractPreviewRecipeDetails(
      filtered_random_pool.slice(0, 3)
    );
  
    return preview_recipe_details;
}




exports.getRecipeDetails = getRecipeDetails;

//???????
exports.getTotalRecipeInfo = getTotalRecipeInfo;


exports.getRecipesPreview = getRecipesPreview;