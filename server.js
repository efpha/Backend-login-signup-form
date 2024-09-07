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

//create connection to mysql
const db = mysql.createConnection(
    {
        host : process.env.DB_HOST,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD,
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

//password hashing

const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

App.post('api/signup', async (req, res) => {
    const { email, username, password } = req.body;

    if(!email || !username || !password){
        console.log("User signed up successfully");
        
        return res.status(400).send(
            {
                message: 'User signed up successfully'
            }
        )
    }

    try{
        //hash password b4 storing it
        const hashedPassword = await hashPassword(password);

        //SQL query to insert into DB
        const query = 'INSERT INTO users (email, username, password) VALUES(?, ?)';

        db.query(query, [username, hashedPassword], (err, results) => {
            if(err){
                console.log('Encountered an error while inserting user into the database\nError:', err);
                return res.status(500).send(
                    {
                        message: 'Server error'
                    }
                )    
            }
            res.send(
                {
                    message: 'User signed up successfully'
                }
            );
        })
    } catch(error){
        console.error('Error during signup:', error);
        res.status(500).send(
            {
                message: 'Server error'
            }
        );

    }
})

//sigin route
App.post('api/signin', (req, res) => {
    const { username, password } = req.body;
    
    if(!username || password){
        return res.status(400).send(
            {
                message: 'Username and password are required!'
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
                    message: "Invalid username or password"
                }
            )
        }

        const user =results[0];

        //compare provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid){
            return res.status(401).send(
                {
                    message: "Inavlid username or password"
                }
            )
        }

        res.status(400).send(
            {
                message: 'User signed in succesfully'
            }
        )
    })

    res.send(
        {
            message: 'User signed in successfully'
        }
    )
})

App.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

