import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

const App = express();
dotenv.config();

const port = process.env.PORT || 3000;
App.use(cors());
App.use(bodyParser.json())

App.post('api/signup', (req, res) => {
    const { username, password } = req.body;
    //Insert into DB LOGIC
    res.send(
        {
            message: 'User signed up successfully'
        }
    )
})

App.post('api/signin', (req, res) => {
    const { username, password } = req.body;
    //check user creadentials in DB
    res.send(
        {
            message: 'User signed in successfully'
        }
    )
})

App.listen(port, () => {
    console.log(`Server running on port ${port}`)
})


