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

router.get("/", (req, res) => res.send("im in user"));
/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
 
  //debugger;

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
    //console.log(req.session.user_id)
    const user_id = req.session.user_id; 
    const recipe_id = req.body.recipe_id;
    //console.log(recipe_id)
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
    console.log(req.session.user_id)
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




module.exports = router;




