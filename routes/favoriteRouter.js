const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
var authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, async (req, res, next) => {
    try {
        const favorite = await Favorite.findOne({ user: req.user._id })
            .populate('user dishes');
        res.status(200).json(favorite);
    } catch (err) {
        next(err);
    }
})
.post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
        let favorite = await Favorite.findOne({ user: req.user._id });
        if (!favorite) {
            favorite = await Favorite.create({
                user: req.user._id,
                dishes: req.body
            });
        } else {
            favorite.dishes = favorite.dishes.filter(d => d);
            req.body.forEach(item => {
                const dishId = typeof item === 'string'
                    ? item
                    : item._id;
            
                const exists = favorite.dishes.some(dish => dish.toString() === dishId);
                if (!exists) {
                    favorite.dishes.push(dishId);
                }
            });
            await favorite.save();
        }

        favorite = await Favorite.findById(favorite._id);
        res.status(200).json(favorite);
    } catch (err) {
        next(err);
    }
})
.delete(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
        const result = await Favorite.deleteOne({ user: req.user._id });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, async (req, res, next) => {
    try {
        const favorite = await Favorite.findOne({ user: req.user._id });
        if (!favorite) {
            return res.json({ exists: false, favorites: null });
        }

        const exists = favorite.dishes.some(dish => dish.toString() === req.params.dishId);
        res.json({ exists, favorites: favorite });
    } catch (err) {
        next(err);
    }
})
.post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
        let favorite = await Favorite.findOne({ user: req.user._id });
        if (!favorite) {
            favorite = await Favorite.create({
                user: req.user._id,
                dishes: [req.params.dishId]
            });
        } else {
            const exists = favorite.dishes.some(dish => dish.toString() === req.params.dishId);
            if (!exists) {
                favorite.dishes.push(req.params.dishId);
                await favorite.save();
            }
        }

        favorite = await Favorite.findById(favorite._id)
            .populate('user dishes');
        res.status(200).json(favorite);
    } catch (err) {
        next(err);
    }
})
.delete(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
        const favorite = await Favorite.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { dishes: req.params.dishId } },
            { new: true }
        ).populate('user dishes');

        if (!favorite) {
            return res.status(404).json({
                error: 'Favorite not found'
            });
        }

        res.status(200).json(favorite);
    } catch (err) {
        next(err);
    }
});

module.exports = favoriteRouter;