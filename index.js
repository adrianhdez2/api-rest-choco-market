const express = require('express')
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser')
const userRoutes = require('./routes/user')

app.use(cookieParser())
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));

app.use('/api/users', userRoutes)


app.listen(8000, () => {
    console.log("En línea...");
});
