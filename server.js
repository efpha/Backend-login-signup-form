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

// Create connection with MySQL
const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// connection to the database
con.connect((err) => {
    if(err){
        console.log("Connection failed", err);
        return
    } else{
        console.log('Connection succesful');
    };
})

// hashing password
const hashedPassword = async(psd) => {
    const saltRounds = 10;
    return await bcrypt.hash(psd,saltRounds)
}

//The new signup route
App.post('/api/signup',async(req, res) => {
    const {email, username, password} = req.body;

    if(email== "" || username == "" || password == ""){
        res.send("Enter all the fields");
        return;
    }

    //try block for signup route
    try {
        const hashed_pswrd = await hashedPassword(password);
        const mysql_query = 'INSERT INTO users(email,username,hashed_pswrd) VALUES(?,?,?)';
        con.query(mysql_query, [email, username, hashed_pswrd],(err, results) => {
            if(err){
                console.log("Error occured while inserting user to the databse", err);
                return res.status(500).send({message:"Server error"});
            }
            res.send({
                message:"User created succesfully",
                status: "200 Ok"
            }) // response that is sent to the frontend
            console.log("User created succesfully");
        });        
    } catch (error) {
        console.log("Error occured while signing up: ",error);
        res.send(error);
    }
})

//new signin route
App.post('/api/signin', async(req,res) => {
    const { email, password } = req.body;

    //backend form validation
    if(email === "" || password === ""){
        return res.send({
            message:"Enter all fields",
        })
    }

    try {
        const sql = "SELECT * FROM users WHERE email=?";

        // promise for mysql query
        const [results] = await con.promise().query(sql, [email]);

            // check whether user exists (0 - no user match, 1 - user exists)
            if(results.length === 0){
                res.send({
                    message:"Invalid email or password" 
                })
            }
            const user = results[0];

            // Compare provided password with the stored hashed password
            const isPasswordValid = await bcrypt.compare(password, user.hashed_pswrd);
            
            if(isPasswordValid){
                res.status(200).send({
                    message:"Login success"
                })
            } else{
                res.send({
                    message:"Invalid user or password"
                })
            }
        
    } catch (error) {
        console.log("Error while signing in: ", error);
        res.send({
            message:"error occured while signing in"
        })
    }


})

/*
Get data from frontend 
Search for email (primary key) from the frontend within the DB
If email is found select all data from the








*/

App.post('/api/forgotpassword', (req, res) => {
    const { email } = req.body;
    res.send({
        message:"Email received in the backend succesfully",
        mail: email
    })

    console.log({email});
})







































// Signin route
// App.post('/api/signin', (req, res) => {
//     const { username, Password } = req.body;

//     if (!username || !Password) {
//         return res.status(400).send({
//             message: 'Username and Password are required!'
//         });
//     }

//     const query = 'SELECT * FROM sign_up WHERE username = ?';

//     db.query(query, [username], async (err, results) => {
//         if (err) {
//             console.log("Error querying the database:", err);
//             return res.status(500).send({
//                 message: "Server error"
//             });
//         }

//         if (results.length === 0) {
//             return res.status(401).send({
//                 message: "Invalid username or Password"
//             });
//         }

//         const user = results[0];

//         // Compare provided Password with the stored hashed Password
//         const isPasswordValid = await bcrypt.compare(Password, user.Password);

//         if (!isPasswordValid) {
//             return res.status(401).send({
//                 message: "Invalid username or Password"
//             });
//         }

//         res.status(200).send({
//             message: 'User signed in successfully'
//         });
//     });
// });

App.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
