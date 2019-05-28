//Note that you can also use passport, but not really needed in this app

const jwt = require('jsonwebtoken');
const config = require('config');


//Note how this middleware can access the req and res variables
module.exports = function(req, res, next){
    // Get the token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if(!token){
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    //Verify token
    try{
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    }catch(err){
        res.status(401).json({ msg: 'Token is not valid' })

    }
}

