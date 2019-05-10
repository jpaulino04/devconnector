const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator/check')
//Note that bodyParser is now included in express
//Note: Although mongoose validates at schema, you should validate imput from user.]


const User = require('../../models/User');

// @route POST api/users
// @desc Register user
// @access Public
router.post('/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            //Notice the status code below
            return res.status(400).json({errors: errors.array()});
        }
        
        const {name, password, email} = req.body;

        try {
            // See if user already exists
            let user = await User.findOne({email});
            console.log(user)

            if(user){
                return res.status(400).json({errors: {msg: "User already exists!"}})
            } 

            // Get User gravatar
            const avatar = gravatar.url(email, {s: '200', r: 'pg', d: '404'});

            user = new User({
                name,
                email,
                password, 
                avatar
            })

            user.save();

            //Encrypt password
            // var salt = bcrypt.genSaltSync('10');

            // Return jsonwebtoken
        
            res.send(user)
        } catch(err) {
            console.log(err.message)
            res.status(500).send("Server error!")
        }
    }    
)


module.exports = router;