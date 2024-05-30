const express = require('express')
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser')
const userRoutes = require('./routes/user')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');

app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/users', userRoutes)


app.listen(8000, () => {
    console.log("En línea...");
});
