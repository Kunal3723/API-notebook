const express = require('express');
const Users = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const JWT_SECRET = "KunalIIitahfj";
const fetchuser = require("../middleware/fetchuser");

//Route 1: create a user using POST "/api/auth/createuser"

router.post("/createuser",
    [body('name', "Valid daal bhai").isLength({ min: 3 }),
    body('email').isEmail(), body('password').isLength({ min: 5 })],
    async function (req, res) {
        console.log(req.body);
        let success = false;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        try {
            //check whether email is unique or not
            let user = await Users.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({
                    success,
                    error: "User with this email laready exist"
                })
            }
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            user = await Users.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            })
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authToken });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Intrnal server error occured");
        }

    })

//Route 2: login a user using POST "/api/auth/login"

router.post("/login",
    [
        body('email', "Enter valid email").isEmail(), body('password', "Enter password").exists()],
    async function (req, res) {
        const errors = validationResult(req);
        let success = false;
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const email = req.body.email;
            const password = req.body.password;

            let user = await Users.findOne({ email });
            if (!user) {
                return res.status(400).json("Enter correct credentials");
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(400).json("Enter correct credentials");
            }

            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authToken });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error occured");
        }
    })

//Route 3:Get data of loggedin user using POST "/api/auth/getuser"
router.post("/getuser", fetchuser,
    async function (req, res) {


        try {
            let userId = req.user.id;
            let user = await Users.findById(userId).select("-password");
            res.send(user);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error occured");
        }
    })


module.exports = router;
