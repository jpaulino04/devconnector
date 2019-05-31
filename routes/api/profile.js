const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator/check');


const Profile = require('../../models/Profile');
const User    = require('../../models/User');

// @route Get api/profile/me
// @desc  Get current users profile
// @access protected
router.get('/me', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar'])

        if(!profile){
            return res.status(401).json({msg: 'Profile not found!'})
        }

        res.json(profile)
    }catch(err){
        console.log(err)
        res.status(500).send('Server Error');
    }
})

///////////////////////////////////////////////////////////////////////////////////////////////
// @route POST api/profile/
// @desc  Create or update user profile
// @access protected
// notice the two middlewares **************************************
router.post('/', [auth, 
[
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]
], 
async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    //Destructure all the fields
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.company = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    //remove any commas or spaces: *****************Important*****************************************
    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    
    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try{
        let profile = await Profile.findOne({user: req.user.id})

        if(profile){
            //update   ********************************Important**************************************
            profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true})

            return res.json({profile})
        }

        //Create new profile
        profile = new Profile(profileFields)

        await profile.save()
        res.json(profile)

    }catch(err){
        console.log(err)
        res.status(500).send('Server Error')
    }
})

///////////////////////////////////////////////////////////////////////////////////////////////
// @route Get  api/profile/
// @desc  All profiles
// @access public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['username','avatar', 'email'])
        res.json(profiles)
        
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


///////////////////////////////////////////////////////////////////////////////////////////////
// @route Get  api/profile/user/:user_id
// @desc  Get profile by the User ID 
//Note that there is also a Profile ID
// @access public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['username','avatar', 'email'])

        if(!profile){
            return res.status(400).json({msg: "Profile not found!"})
        }
        res.json(profile)
        
    } catch (err) {
        console.error(err.message)
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: "Profile not found!"})
        }
        res.status(500).send('Server Error')
    }
})


///////////////////////////////////////////////////////////////////////////////////////////////
// @route Delete api/profile/
// @desc  Delete profile, user & posts
// @access Private

router.delete('/', auth, async (req, res) => {

    //@Todo: Remove user's posts

    //Remove Profile
    await Profile.findOneAndRemove({user: req.user.id})
    //Remove User
    await User.findOneAndRemove({_id: req.user.id})


    res.json({msg: "User removed"});
})


///////////////////////////////////////////////////////////////////////////////////////////////
// @route PUT api/profile/experience
// @desc  Add Profile Experience
// @access Private
//Note: Experience is part of the Profile document
//Its lie its own resource but part of profile
// Reason why we are making it a PUT instead of a POST


router.put('/experience', [auth,
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
],
async (req, res) => {

    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        console.log(errors)
        return res.status(400).json({errors: errors.array()})
    }

    const {
        title, 
        company,
        from,
        to,
        location,
        current,
        description
    } = req.body;

    const newExp = {title, company, location, from, to, current, description}

    try {
        const profile = await Profile.findOne({user: req.user.id})

        //Unshift places the item at the beginning of the array (on top)
        profile.experience.unshift(newExp);

        await profile.save();
        res.json({experience: profile})
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
    
})

///////////////////////////////////////////////////////////////////////////////////////////////
// @route DELETE api/profile/experience/:exp_id
// @desc  Delete profile experience
// @access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user:req.user.id});

        // Get index of item to remove
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);        

        profile.experience.splice(removeIndex, 1);

        await profile.save()

        res.json({msg: "Deleted profile", result: profile})

    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server Error")
    }
})

///////////////////////////////////////////////////////////////////////////////////////////////
// @route PUT api/profile/education
// @desc  Add Profile Education
// @access Private

router.put('/education', [auth,
    [

    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty()
    ]

], 
async(req, res) => {

    const errors = validationResult(req);

    const { school, degree, fieldofstudy, from, to, current, description} = req.body;
    const newEdu = {school, degree, fieldofstudy, from, to, current, description};

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    

    try {        

        const profile = await Profile.findOne({user: req.user.id})

        profile.education.unshift(newEdu)

        await profile.save();

        res.json(profile)
        
    } catch (err) {
        return res.status(500).send("Server Error")
    }

})




///////////////////////////////////////////////////////////////////////////////////////////////
// @route DELETE api/profile/education/:exp_id
// @desc  Delete profile education
// @access Private
router.delete('/education/:edu_id', auth, async(req, res) => {

    try {
        const profile = await Profile.findOne({user: req.user.id})

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);        

        profile.education.splice(removeIndex, 1);

        await profile.save()

        res.json({msg: "Deleted education", result: profile})


    } catch (err) {
        return res.status(500).send("Server Error!");
    }


})

///////////////////////////////////////////////////////////////////////////////////////////////
// @route GET api/profile/github/:username
// @desc  GET user repos from Github
// @access Public

router.get('/github/:username', (req, res) => {
    
    try {

        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubClientSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        }

        request(options, (error, response, body) => {
            if(error) console.log(error);

            if(response.statusCode !== 200){
                return res.status(404).json({msg: "No Github Profile found"})
            }

            res.json(JSON.parse(body));
        })
        
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Errror')
    }
})



module.exports = router;