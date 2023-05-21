const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
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


//________________________help func___________
async function getRecipeInfoURL(recipeID) {
    return await axios.get(`${api_domain}/${recipeID}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

// ___________________________________________



async function getTotalRecipeInfo(userId, recipeId) {

    let all_recipe_info = await getRecipeInfoURL(recipeId);

    let { //save from API all the needed info for the recipe 
        data: {
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
        },
      } = recipe_info;

    let recipe_ingredients_list = extendedIngredients.map(({ name, amount }) => ({ name, amount })); //append to the list all ingredients of the recipe and how much we need
    
    
    let if_recipe_exist_in_user_favorites = await  user_utils.checkIsFavorite(user_id,id); //??????????????
    let if_recipe_watched_by_user =  await user_utils.checkIsWatched(user_id,id); //??????????
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



async function get3randomRecipe() {
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



