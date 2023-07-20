var express = require("express");
const app = express();
const morgan = require("morgan"); // logging library
const port = process.env.PORT || "3000";
app.use(express.json()); // parse application/json
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

// router.get("/", (req, res) => res.send("im in user"));
/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id; 
    const recipe_id = req.body.recipe_id;
    let recipes_ids = [];
    recipes_ids = await DButils.execQuery(`SELECT recipe_id from favoriterecipes where user_id='${user_id}'`);
    if (!(recipes_ids.find((x) => x.recipe_id === recipe_id))){
      await user_utils.markAsFavorite(user_id,recipe_id);
      res.status(200).send("The Recipe successfully saved as favorite");
    }
  
    } catch(error){
      next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id); //all good
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array, user_id); //here - done?
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


// ____________________________we added_______________________________________________

router.post('/lastseen', async (req,res,next) => {//add recipe to the last seen recipes of user
  try{
    const user_id = req.session.user_id; 
    const recipe_id = req.body.recipe_id;
    let recipes_ids = [];
    recipes_ids = await DButils.execQuery(`SELECT recipe_id from lastrecipes where user_id='${user_id}'`);
    if (!(recipes_ids.find((x) => x.recipe_id === recipe_id))){
      await user_utils.markAsWatched(user_id,recipe_id);
      res.status(200).send("The Recipe successfully saved as lastseen");
    }
  
    } catch(error){
      next(error);
  }
})

router.get('/lastseen', async (req,res,next) => { //shows all last seen recipes of user
  try{
    const user_id = req.session.user_id;
    // console.log(req.session.user_id)

    const recipes_id = await user_utils.getlastseenRecipes(user_id); //all good
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array, user_id); //here - done?
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~

router.get('/familyRecipes', async (req,res,next) =>{ ////get all family recipes of logged in given user
  try{
    const user_id = req.session.user_id;
    // const recipe_id = req.body.recipe_id
    const famRecipes = await user_utils.getFamilyRecipes(user_id);
    res.status(200).send(famRecipes);
  }
  catch(error){
    next(error)
  }
})

router.post('/familyRecipes', async (req,res,next) => { //this function will add a new family recipe of logged in user
  try{
    let recipe_details = {
      user_id: req.session.user_id,
      recipe_title: req.body.recipe_title,
      recipe_of: req.body.recipe_of,
      time: req.body.time,
      ingredients:req.body.ingredients,
      instructions: req.body.instructions,
      when_prepared: req.body.when_prepared,
      recipe_photo:req.body.recipe_photo
    }

    const fullFamilyRecipe = await user_utils.insertFamilyRecipe(recipe_details);
    res.status(201).send({ message: "recipe created", success: true });

  }
  catch(error){
    next(error)
  }

})



// ~!!!!!!!!!!!!!!!!!!!!!!!!!!
//this function will add a new personal recipe of logged in user
router.post("/CreateRecipe", async (req, res, next) => {
  try {
    let recipe_details = {
      user_id: req.session.user_id,
      title: req.body.title,
      time: req.body.readyInMinutes ,
      image: req.body.image,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      // likes: req.body.likes,
      gluten: req.body.glutenFree,
      instructions: req.body.instructions,
      servings: req.body.servings,
      ingredients: req.body.ingredients
    }

    const newRecipeToCreate = await user_utils.createNewRecipes(recipe_details);
    
    res.status(201).send({ message: "Your new recipe has been successfully created", success: true });

  }
  catch(error){
    next(error)
  }

});

// create the function. needs to get my recipes from DB
router.get('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const private_recipes = await user_utils.getMyRecipes(user_id);
    res.status(200).send(private_recipes);
  } catch(error){
    next(error); 
  }
});

// router.get('/lastSearch', async (req,res,next) => {
//   try{
//     const lastSearch = req.session.lastSearch;
//     res.status(200).send(lastSearch);
//   } catch(error){
//     next(error); 
//   }
// });



module.exports = router;




