import express from 'express'; 
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser'; 
import bcrypt from 'bcrypt';

const App = express();
dotenv.config();

const port = process.env.PORT || 3001;
App.use(cors());
App.use(bodyParser.json())

// Create connection to MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL Database
db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
        return;
    } else {
        console.log("Connected to MySQL");
    }
});

// Password hashing function
const hashPassword = async (Password) => {
    const saltRounds = 10;
    return await bcrypt.hash(Password, saltRounds);
};

// Signup route
App.post('/api/signup', async (req, res) => {
    const { email, username, password } = req.body; // Changed to lowercase
    
    console.log(req.body);

    if (!email || !username || !password) {
        return res.status(400).send({ message: 'Email, username, and password are required!' });
    }

    try {
        const hashedPassword = await hashPassword(password); // Pass the correct variable name
        const query = 'INSERT INTO sign_up (Email, username, Password) VALUES (?, ?, ?)';

        db.query(query, [email, username, hashedPassword], (err, results) => {
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


// Signin route
App.post('/api/signin', (req, res) => {
    const { username, Password } = req.body;

    if (!username || !Password) {
        return res.status(400).send({
            message: 'Username and Password are required!'
        });
    }

    const query = 'SELECT * FROM sign_up WHERE username = ?';

    db.query(query, [username], async (err, results) => {
        if (err) {
            console.log("Error querying the database:", err);
            return res.status(500).send({
                message: "Server error"
            });
        }

        if (results.length === 0) {
            return res.status(401).send({
                message: "Invalid username or Password"
            });
        }

        const user = results[0];

        // Compare provided Password with the stored hashed Password
        const isPasswordValid = await bcrypt.compare(Password, user.Password);

        if (!isPasswordValid) {
            return res.status(401).send({
                message: "Invalid username or Password"
            });
        }

        res.status(200).send({
            message: 'User signed in successfully'
        });
    });
});

App.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
