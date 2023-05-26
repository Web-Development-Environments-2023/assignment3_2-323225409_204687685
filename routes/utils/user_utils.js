const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    let recipesList = [];
    recipesList = await DButils.execQuery(`SELECT recipeID from favoriterecipes where userID='${user_id}'`);
    if (!(recipesList.find((x) => x.recipe_id === recipe_id))){ //if we not have this recipe in the favorites so we can add it
        await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
    }

    
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipeID from favoriterecipes where userID='${user_id}'`);
    return recipes_id;
}

async function checkIfFavorite(userID,recID){// this function checks if the recipe exist in user favorite recipes if not returns false.
    const query = `SELECT recipeID FROM favoriterecipes WHERE userID= '${userID}' AND recipeID = '${recID}'`;
    const recipes = await DButils.execQuery(query);
    return recipes.length > 0;
}

async function checkIfWatched(userID,recID){//this function checks if the user seen this recipe before.
    const query = `SELECT recipeID FROM lastrecipes WHERE userID = '${userID}' AND recipeID = '${recID}'`;
    const recipes = await DButils.execQuery(query);
    return recipes.length > 0;
}




exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
