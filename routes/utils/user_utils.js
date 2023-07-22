const DButils = require("./DButils");
// import { execQuery } from "./DButils"; maybe convert the require


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


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
async function getFamilyRecipes(user_id){ //get all family recipes of logged in given user
   
    let famRecipsList = [];
    query = `SELECT * FROM familyrecipes WHERE user_id='${user_id}'`;

    famRecipsList = await DButils.execQuery(query);

    for (const recipe of famRecipsList) {
        let ingredientsQuery = `SELECT name, amount FROM ingredients WHERE user_id='${user_id}' AND recipe_id='${recipe.recipe_id}'`;
        let ingredientsList = await DButils.execQuery(ingredientsQuery);
        recipe.ingredients = ingredientsList;
    }

    return famRecipsList;
}

async function insertFamilyRecipe(recipe_details){

    let recipes_titles = []; //we check if we already have this recipe in DB
    recipes_titles = await DButils.execQuery(`SELECT recipe_title from familyrecipes WHERE user_id = '${recipe_details.user_id}'`);
    if (recipes_titles.find((x) => x.recipe_title === recipe_details.recipe_title))
      throw { status: 409, message: "recipe title already exist" };

    // add the new recipe
    await DButils.execQuery(
      `INSERT INTO familyrecipes(user_id,recipe_title,recipe_of,time,instructions,when_prepared, recipe_photo) VALUES 
      ( '${recipe_details.user_id}','${recipe_details.recipe_title}','${recipe_details.recipe_of}', '${recipe_details.time}', 
        '${recipe_details.instructions}', '${recipe_details.when_prepared}','${recipe_details.recipe_photo}')`
    );


    let recipes_id = [];
    recipes_id = await DButils.execQuery(`SELECT MAX(recipe_id) as recipe_id from familyrecipes`);


    await recipe_details.ingredients.map((element) => DButils.execQuery(
      `INSERT INTO ingredients VALUES ('${recipe_details.user_id}','${"F"+recipes_id[0].recipe_id}', '${element.name}','${element.amount}')`
    ));

    return recipe_details;

}



async function createNewRecipes(recipe_details){

    let recipes_names_list = [];
    recipes_names_list = await DButils.execQuery("SELECT title from myrecipes");
    if (recipes_names_list.find((x) => x.title === recipe_details.title))
      throw { status: 409, message: "This recipe already exist" };

    //we add the new recipe to our DB - the recipe will show on myrecipes page
    await DButils.execQuery(
      `INSERT INTO myrecipes(user_id,title,servings,readyInMinutes,image,instructions,glutenFree,vegan,vegetarian) VALUES 
      ( '${recipe_details.user_id}','${recipe_details.title}','${recipe_details.servings}','${recipe_details.readyInMinutes}','${recipe_details.image}',   
      '${recipe_details.instructions}','${recipe_details.glutenFree}','${recipe_details.vegan}','${recipe_details.vegetarian}')`
    );
    await DButils.commit();

    let recipes_id = [];
    recipes_id = await DButils.execQuery(`SELECT MAX(id) as recipe_id from myrecipes`);

    await recipe_details.ingredients.map((element) => DButils.execQuery(
        `INSERT INTO ingredients VALUES ('${recipe_details.user_id}','${"P"+recipes_id[0].recipe_id}', '${element.name}','${element.amount}')`
    ));
    await DButils.commit();
    return recipe_details;
} 
 


async function getMyRecipes(user_id){ //get all family recipes of logged in given user
   
    let myRecipsList = [];
    query = `SELECT * FROM myrecipes WHERE user_id='${user_id}'`;

    myRecipsList = await DButils.execQuery(query);

    for (const recipe of myRecipsList) {
        let ingredientsQuery = `SELECT name, amount FROM ingredients WHERE user_id='${user_id}' AND recipe_id='${recipe.recipe_id}'`;
        let ingredientsList = await DButils.execQuery(ingredientsQuery);
        recipe.ingredients = ingredientsList;
    }

    return myRecipsList;
}




async function getFullMyRecipe(user_id, recipe_id){ //show my recipe of logged in given user
   
    let myRecipe;
    query = `SELECT * FROM myrecipes WHERE user_id='${user_id}' AND id='${recipe_id}' `;

    myRecipe = await DButils.execQuery(query);

    
    let ingredientsQuery = `SELECT name, amount FROM ingredients WHERE user_id='${user_id}' AND recipe_id='${"P"+recipe_id}'`;
    let ingredientsList = await DButils.execQuery(ingredientsQuery);
    // console.log(ingredientsList);
    myRecipe[0].ingredients = ingredientsList;

    return myRecipe;
}


exports.getMyRecipes = getMyRecipes;
exports.markAsFavorite = markAsFavorite;
exports.markAsWatched = markAsWatched;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.checkIfFavorite =checkIfFavorite;
exports.checkIfWatched = checkIfWatched;
exports.getlastseenRecipes = getlastseenRecipes;
exports.getFamilyRecipes = getFamilyRecipes;
exports.insertFamilyRecipe = insertFamilyRecipe;
exports.createNewRecipes = createNewRecipes;
exports.getFullMyRecipe = getFullMyRecipe;


