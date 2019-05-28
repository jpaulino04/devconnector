const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const config = require('config')
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt    = require('jsonwebtoken');
const {check, validationResult} = require('express-validator/check')


router.get('/', auth, async (req, res) => {
    try{
		//after the auth middleware the user.id is available
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error');
    }
})


// @route POST api/auth
// @desc Authenticate user & get token
// @access Public
router.post('/', 
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            //Notice the status code below
            return res.status(400).json({errors: errors.array()});
        }
        
        const {password, email} = req.body;

        try {
            // See if user already exists
            let user = await User.findOne({email});

            if(!user){
                return res.status(400).json({errors: [{msg: "Invalid credentials"}]})
            } 

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return res.status(400).json({errors: [{msg: "Invalid credentials"}]})
            }

            const payload = {
                user: {
                    id: user.id
                }
            }            

            jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 3600}, (err, token) => {
                if(err) throw err;
                res.json({token})
                //You can send back anything, depending on your app
            })

            
        } catch(err) {
            console.log(err.message)
            res.status(500).send("Server error!")
        }
    }    
)

module.exports = router;