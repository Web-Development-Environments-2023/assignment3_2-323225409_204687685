const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    let recipesList = [];
    recipesList = await DButils.execQuery(`SELECT recipe_id from favoriterecipes where user_id='${user_id}'`);
    if (!(recipesList.find((x) => x.recipe_id === recipe_id))){ //if we not have this recipe in the favorites so we can add it
        await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
    }

    
}

async function markAsWatched(user_id, recipe_id){
    let recipesList = [];
    recipesList = await DButils.execQuery(`SELECT recipe_id from lastrecipes where user_id='${user_id}'`);
    if (!(recipesList.find((x) => x.recipe_id === recipe_id))){ //if we not have this recipe in the favorites so we can add it
        await DButils.execQuery(`insert into lastrecipes values ('${user_id}',${recipe_id})`);
    }

    
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}'`);
    return recipes_id;
}
async function getlastseenRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from lastrecipes where user_id='${user_id}'`);
    return recipes_id;
}




async function checkIfFavorite(user_id,recipe_id){// this function checks if the recipe exist in user favorite recipes if not returns false.
    const query = `SELECT recipe_id FROM favoriterecipes WHERE user_id= '${user_id}' AND recipe_id = '${recipe_id}'`;
    const recipes = await DButils.execQuery(query);
    return recipes.length > 0;
}

async function checkIfWatched(user_id,recipe_id){//this function checks if the user seen this recipe before.
    const query = `SELECT recipe_id FROM lastrecipes WHERE user_id = '${user_id}' AND recipe_id = '${recipe_id}'`;
    const recipes = await DButils.execQuery(query);
    return recipes.length > 0;
}




exports.markAsFavorite = markAsFavorite;
exports.markAsWatched = markAsWatched;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.checkIfFavorite =checkIfFavorite;
exports.checkIfWatched = checkIfWatched;
exports.getlastseenRecipes = getlastseenRecipes;




