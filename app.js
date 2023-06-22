const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
const name = "Aditya"
app.get('/', (req, res) => {
    res.render('index',{userName:name,surName:"Dubey"});
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});