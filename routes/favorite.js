const express = require('express');
const bodyParser = require('body-parser');
// please do not forget to add the user verification
const favoriteRouter = express.Router();

const Favorites = require('../models/favorites');
var authenticate = require('../authenticate');
favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
.get(authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({user : req.user._id}).
    populate('user')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user:req.user._id})
    .then((favorites) => {
            if (favorites) {
            for (var i=0; i<req.body.length; i++) {
                if (favorites.dishes.indexOf(req.body[i]._id) === -1) {
                    favorites.dishes.push(req.body[i]._id);
                }
            }
            favorites.save()
            .then((favorites)=>{
                console.log('Favorite Created ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            },(err) => next(err));
            }
        else {
            Favorites.create({"user": req.user._id, "dishes": req.body})
            .then((favorites) => {
                console.log('Favorite Created ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(authenticate.verifyUser,(req, res, next) => {
    Favorites.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.get(authenticate.verifyUser,(req,res,next) => {
   res.statusCode = 403;
    res.end('GET operation not supported on /favorites/whatever'+ req.params.dishId);
})
.post(authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user : req.user._id})
    .then((favorite) =>{
        var flag = 0;
        var idsArray = favorite.dishes;
        for(i = 0;i < idsArray.length;i++){
            if(idsArray[i] == req.params.dishId){
                flag = 1;
            }
        }
        if(flag == 0){
            favorite.dishes.push(req.params.dishId);
            favorite.save()
            .then((favorite) => {
                Favorites.find({user: req.user._id})
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })            
            }, (err) => next(err));
        }
        else{
            res.statusCode = 403;
            res.end('This dish is already added to your favorites list');
        }
    } ,(err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user : req.user._id})
    .then((favorite) => {
       if (favorite != null) {
            var index;
            for(var i = 0;i < favorite.dishes.length;i++){
                if(favorite.dishes[i] == req.params.dishId){
                    index = i;
                }
            }
            favorite.dishes.splice(index,1);            
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                 
                res.json(favorite);                
            }, (err) => next(err));
        }
        else {
            err = new Error('you do not even have a favorites list, consider creating one');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});





module.exports = favoriteRouter;