const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session');
const app = express();
const jwt = require('jsonwebtoken');
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const port = 8000;

const cors = require('cors');
app.use(cors());

const bcrypt = require('bcrypt')



mongoose.connect(`mongodb://localhost:27017/codingPlatform`)
    .then(() => {
        console.log(`MongoDB Connected on port : 27017`)
    })
    .catch((err) => { console.log(err) })

let myschema = new mongoose.Schema({
    email: String,
    password: String
})

let mymodel = new mongoose.model("users", myschema);


app.get('/', (req, res) => {
    console.log(req.data);
    res.json('Hello World!');
});

app.post('/login', async(req, res) => {
    console.log(req.data);
    const {email,password} = req.body;

    try{
        const check = await mymodel.findOne({email:email});
        console.log(check);
        if(check){
            const isMatched = await bycrypt.compare(req.body.password,check.password);
            if(isMatched) {
                const user = {email:req.body.email}
                const accesstoken = generateAccessToken(user);
                const refreshtoken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET);
                res.json({accesstoken:accesstoken , refreshtoken:refreshtoken});
            }
            else{
                res.join("passwordNotCorrect");
            }
        }
        else{
            res.json("notexists");
        }
    }
    catch(e){
        res.json("notexists");
    }
});


app.post('/signup', async(req, res) => {
    const validPassword = (password) => {
        const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
        return strongPasswordPattern.test(password);
    };
    console.log(req.data);
    const {email,password} = req.body;
    const data = {
        email:email,
        password:password
    }
    const validationError = validPassword(password);
    if (!validationError) {
        return res.status(400).json({ error: validationError });
    }
    try{
        const check = await mymodel.findOne({email:email});
        if(check){
            res.json("exists");
        }
        else{
            const saltRounds = 10;
            const hashed = await bcrypt.hash(password,saltRounds);

            data.password = hashed;
            await mymodel.insertMany([data]);
            console.log("Entered");
            res.json("notexists");
        }app.post('/signup', async (req, res) => {
            const { email, password } = req.body;
        
            // Password validation function
            const validPassword = (password) => {
                const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                return strongPasswordPattern.test(password);
            };
        
            if (!validPassword(password)) {
                return res.status(400).json({ error: 'Password does not meet the required criteria.' });
            }
        
            try {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(409).json('User already exists');
                }
        
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
        
                const newUser = new User({
                    email: email,
                    password: hashedPassword,
                });
        
                await newUser.save();
                console.log("User registered successfully");
        
                const accessToken = generateAccessToken({ email: newUser.email });
                const refreshToken = jwt.sign({ email: newUser.email }, process.env.REFRESH_TOKEN_SECRET);
                refreshTokens.push(refreshToken);
        
                res.status(201).json({ accessToken, refreshToken });
            } catch (err) {
                console.error(err);
                res.status(500).json('Internal server error');
            }
        });
        
    }
    catch(e){
        res.json("notexists");
        console.log(e);
    }
});
function generateAccessToken(user){
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'5s'});
}
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
})