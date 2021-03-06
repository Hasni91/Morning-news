var express = require('express');
var router = express.Router();

var uid2 = require("uid2");
var SHA256 = require("crypto-js/sha256");
var encBase64 = require("crypto-js/enc-base64");

const UserModel = require('../models/users');


/* GET home page. */
router.post('/sign-up', async function(req, res, next) {
	
	if (req.body.name && req.body.email && req.body.password) {
	
		let userObj = await UserModel.findOne({ email: req.body.email });
		
		if( userObj ) {
			res.json({ success: false , error: 'Email déjà enregistré' });
			return 0;
		}
		
		let saltuser = uid2(32);
		let encryptPassword = SHA256(req.body.password + saltuser).toString(encBase64);
		
		let tokenuser = uid2(32);
		
		userObj = new UserModel ( {
			name: req.body.name,
			langue : JSON.stringify( {lang:'fr', country:'fr'} ),
			email: req.body.email,
			password: encryptPassword,
			salt: saltuser,
			token: tokenuser,
			wishlist:[],
		} );	
		
		let userSaved = await userObj.save(); //var movieSaved =  pas besoin de sauver une variable
		
		if(userSaved) { success = true } else { success = { success: false , error: 'Error au moment de la sauvegarde' } }
		
		res.json({ success, userToken: userSaved.token });
		
	} else {
		res.json({ success: false , error: 'Remplissez vos champs de saisie' });
	}
});

router.post('/sign-in', async function(req, res, next) {
	
	if (req.body.email && req.body.password) {
		
		let userObj = await UserModel.findOne({ email: req.body.email });
		let hash = SHA256(req.body.password + userObj.salt).toString(encBase64);
   
		if( userObj ) {
		
			if ( hash === userObj.password ){
			
				let newToken = uid2(32);
				userObj = await UserModel.updateOne( { email: req.body.email }, {token: newToken} );
				
				res.json({ success: true, userToken: newToken });
				
			} else {
				res.json({ success: false, error: 'Email ou mot de passe incorrects' });
			}
			
		} else {
			res.json({ success: false, error: `Vous n'êtes pas enregistré.e` });
		}
	}
	else {
		res.json({ success: false , error: 'Remplissez vos champs de saisie' });
	}
});

router.post("/wishlist", async function(req,res,next){

	var wishlistVie = {
		idArticle : req.body.id,
		image : req.body.image,
		titre : req.body.titre,
		description : req.body.description,
		contenu : req.body.contenu,
	}
	
	var Mywishlist = await UserModel.findOne({ token: req.body.token });
	Mywishlist.wishlist.push(wishlistVie);
	 await Mywishlist.save();
	res.json({success: true, Mywishlist})
})

router.get("/article", async function(req,res,next){
	var utilisateur = await UserModel.findOne({ token: req.query.token });
	var wishlist = utilisateur.wishlist;
	console.log("ma wish wish", wishlist);

	res.json({success: true, wishlist});
})

router.post('/save-language', async function(req, res, next) {
	
	
	if ( req.body.lang && req.body.country && req.body.token ) {
		userObj = await UserModel.updateOne( 
			{ token: req.body.token }, 
			{ langue: JSON.stringify( {lang: req.body.lang,country: req.body.country} ) } 
		);
		
		res.json({ success: true });
				
	} else {
		res.json({ success: false, error: 'Error survenu en enregistrant votre langue par défaut' });
	}
});


router.get('/get-language', async function(req, res, next) {
	
	if ( req.query.token ) {
		let userObj = await UserModel.findOne( { token: req.query.token } );
		console.log(userObj)
		let languageSettings = JSON.parse(userObj.langue) ;
		
		res.json({ success: true, languageSettings: languageSettings });
				
	} else {
		res.json({ success: false, error: 'Error survenu en enregistrant votre langue par défaut' });
	}
});

module.exports = router;




