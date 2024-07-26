import bodyParser from "body-parser";
import express from 'express';
import pg from "pg";
const app = express();
const port = 3000;


const db = new pg.Client({
    user: "postgres",
    host: "localhost" ,
    database: "world",
    password: "123456789",
    port: 5432,
})

db.connect()

// In-memory data store
let quiz = [
    // { country: "France", capital: "Paris" },
    // { country: "United Kingdom", capital: "London" },
    // { country: "United States of America", capital: "Washington, D.C." },
];

db.query("SELECT * FROM capitals", (err,res)=>{
    if(err){
        console.error("error executing querry", err.stack);
    }
    else{
        quiz = res.rows;
    }

    db.end();
})

let totalCorrect = 0;
let currentQuestion = {};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Function to select the next question
async function nextQuestion() {
    const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
    currentQuestion = randomCountry;
}

// Route to serve the main page
app.get("/", async (req, res) => {
    totalCorrect = 0;
    await nextQuestion();
    console.log(currentQuestion);
    res.render("index.ejs", { question: currentQuestion });
});

// Route to handle form submissions
app.post("/submit", (req, res) => {
    let answer = req.body.answer.trim();
    let isCorrect = false;
    if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
        totalCorrect++;
        console.log(totalCorrect);
        isCorrect = true;
    }
    nextQuestion();
    res.render("index.ejs", {
        question: currentQuestion,
        wasCorrect: isCorrect,
        totalScore: totalCorrect,
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
