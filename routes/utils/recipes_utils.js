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







exports.getRecipeDetails = getRecipeDetails;



