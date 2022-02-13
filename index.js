const connectToMongo = require('./db');
const dotenv=require("dotenv");
const express = require('express')
const app = express()
connectToMongo();
var cors = require('cors')
app.use(cors())
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`iNoteBook Backend listening at http://localhost:${PORT}`)
})