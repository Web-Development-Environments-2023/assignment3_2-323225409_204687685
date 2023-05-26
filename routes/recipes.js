var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


//___________________________we implemented______only server connections_________________________________________

//number of recipes that came back, sort the results, cuisine and diet types, intolerance kinds
//frome here we will send it to utils the ask from the api

router.get("/searchRecipes", async (req, res, next) => { //maybe need guest before "/"
  const query = req.query;
  try {
    let recipe_search = await recipes_utils.getSearchRecipe(query.query, query.amount, query.cuisine, query.diet, query.intolerance, query.sort);
    res.send(recipe_search);
  } catch (error) {
    next(error);
    // console.log(error);
    // res.sendStatus(404);
  }
});



//this func get all the details of the recipe and send it to the client
router.get("/totalRecipeInfo/:recipe_id", async (req, res, next) => {
  const sess = req.session;
  try {
    const userId = sess.user_id;
    const recipe_info_to_return = await recipes_utils.getTotalRecipeInfo(userId,req.params.recipeId);

  } catch (error) {
    next(error);
    // console.log(error);
    // res.sendStatus(404);
  }
});







//this func get 3 random recipe from api and send it to the client
router.get("/random3recipes", async (req, res, next) => {
  try {
    let random3 = await recipes_utils.get3randomRecipe();
    res.send(random3);
  
  } catch (error) {
    next(error);
    // console.log(error);
    // res.sendStatus(404);
  }
});



module.exports = router;
