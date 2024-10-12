import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser'; 
import bcrypt from 'bcrypt';

const App = express();
dotenv.config();

const port = process.env.PORT;
App.use(cors());
App.use(bodyParser.json())

//create connection to mysql
const db = mysql.createConnection(
    {
        host : process.env.DB_HOST,
        user : process.env.DB_USER,
        Password : process.env.DB_PASSWORD,
        database : process.env.DB_NAME
    }
)
//connect to mysql Database
db.connect((err) => {
    if(err){
        console.log("Database connection failed:", err);
        return;
    } else{
        console.log("Connected to mysql");
    }
});

//Password hashing
const hashPassword = async (Password) => {
    const saltRounds = 10;
    return await bcrypt.hash(Password, saltRounds);
}
//Signup route
App.post('/api/signup', async (req, res) => {
    const { Email, username, Password } = req.body;

    if (!Email || !username || !Password) {
        return res.status(400).send({ message: 'Email, username, and Password are required!' });
    }

    try {
        const hashedPassword = await hashPassword(Password);

        const query = 'INSERT INTO users (Email, username, Password) VALUES (?, ?, ?)';

        db.query(query, [mail, username, hashedPassword], (err, results) => {
            if (err) {
                console.log('Error inserting user:', err);
                return res.status(500).send({ message: 'Server error' });
            }
            res.send({ message: 'User signed up successfully' });
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send({ message: 'Server error' });
    }
});

//sigin route
App.post('/api/signin', (req, res) => {
    const { username, Password } = req.body;
    
    if(!username || !Password){
        return res.status(400).send(
            {
                message: 'Username and Password are required!'
            }
        )
    }

    //sql quiry to fing user in the DB by their username
    const query = 'SELECT * FROM users WHERE username = ?';

    db.query(query, [username], async (err, results) => {
        if(err){
            console.log("Error querying the database:", err);
            return res.status(500).send(
                {
                    message: "Server error"
                }
            )
        }

        if(results.length === 0){
            return res.status(401).send(
                {
                    message: "Invalid username or Password"
                }
            )
        }

        const user =results[0];

        //compare provided Password with the stored hashed Password
        const isPasswordValid = await bcrypt.compare(Password, user.Password)

        if(!isPasswordValid){
            return res.status(401).send(
                {
                    message: "Invalid username or Password"
                }
            )
        }

        res.status(400).send(
            {
                message: 'User signed in succesfully'
            }
        )
    })
})

App.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

