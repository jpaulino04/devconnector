const express = require('express');
const router = express.Router();
const {check, validationResults} = require('express-validator/check');

const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// @route POST /api/posts
// @desc  Create a post
//@access Private
router.get('/', [auth,
    check('text', 'Text is required').not().isEmpty()
],
async (req, res) => {
    const errors = validationResults(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const user = await User.findById(req.user.id).select('-password')

    try {
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})


module.exports = router;