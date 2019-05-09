const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check')
//Note that bodyParser is now included in express
//Note: Although mongoose validates at schema, you should validate imput from user.

// @route POST api/users
// @desc Register user
// @access Public
router.post('/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})
    ],
    (req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            //Notice the status code below
            return res.status(400).json({errors: errors.array()});
        }
        
        // See if user already exists

        // Get User gravatar

        //Encrypt password

        // Return jsonwebtoken
        
        res.send('Hello from users!')

    }    
)


module.exports = router;