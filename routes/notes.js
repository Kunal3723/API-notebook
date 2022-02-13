const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const router = express.Router();
const { body, validationResult } = require('express-validator');

//Route 1:Get all the notes of a user using GET "/api/notes/fetchallnotes"
router.get("/fetchallnotes", fetchuser,
    async function (req, res) {
        try {
            const notes = await Notes.find({ user: req.user.id });
            res.json(notes);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Intrnal server error occured");
        }
    })

//Route 2:Add notes using POST "/api/notes/addnote"
router.post("/addnote", fetchuser,
    [body('title', "Enter valid title").isLength({ min: 3 }),
    body('description', "Enter description").isLength({ min: 1 })],
    async function (req, res) {


        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { title, description, tag } = req.body;

            const note = new Notes({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save();
            res.json(savedNote);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Intrnal server error occured");
        }
    })

//Route 3:Update notes of a user using PUT "/api/notes/updatenote"
router.put("/updatenote/:id", fetchuser, async function (req, res) {
    try {
        const { title, description, tag } = req.body;
        const newNote = {};
        if (title) {
            newNote.title = title;

        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        const note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }

        if (note.user.toString() != req.user.id) {
            return res.status(401).send("Unauthorized");
        }

        const updatedNote = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.send({ updatedNote });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Intrnal server error occured");
    }
})

//Route 4:Delete notes of a user using DELETE "/api/notes/updatenote"
router.delete("/deletenote/:id", fetchuser, async function (req, res) {


    try {
        const note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }

        if (note.user.toString() != req.user.id) {
            return res.status(401).send("Unauthorized");
        }

        const deletedNote = await Notes.findByIdAndDelete(req.params.id);
        res.send({ "Succes": "Note has been deleted ", deletedNote });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Intrnal server error occured");
    }
})

module.exports = router;