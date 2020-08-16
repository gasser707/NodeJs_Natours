const express = require('express');
const viewRouter = express.Router()
const {getOverview, getTour, login, getAccount} = require('../controllers/viewsController')
const {isLoggedIn, protect} = require('../controllers/authController');
const { router } = require('../app');

viewRouter.route('/').get(isLoggedIn, getOverview)
viewRouter.route('/tour/:slug').get(isLoggedIn, getTour)  
viewRouter.route('/login').get(isLoggedIn, login)
viewRouter.route('/me').get(protect,getAccount)

module.exports= viewRouter