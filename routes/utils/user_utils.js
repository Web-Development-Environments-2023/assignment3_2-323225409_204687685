const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function checkIfFavorite(userID,recID){// this function checks if the recipe exist in user favorite recipes if not returns false.
    const query = `SELECT recipe_id FROM favoriteRecipes WHERE user_id = '${userID}' AND recipe_id = '${recID}'`;
    const recipes = await DButils.execQuery(query);
    return recipes.length > 0;
}

async function checkIfWatched(userID,recID){//this function checks if the user seen this recipe before.
    const query = `SELECT recipe_id FROM last_recipes WHERE user_id = '${userID}' AND recipe_id = '${recID}'`;
    const recipes = await DButils.execQuery(query);
    return recipes.length > 0;
}




exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
