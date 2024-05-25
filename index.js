const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

const userRoutes = require('./routes/user')
app.use('/api/users', userRoutes) 


app.listen(8000, () => {
    console.log("En línea...");
});
