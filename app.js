const express = require("express");
const app = express();
const axios = require('axios');
const serverless = require("serverless-http");
const path = require("path");

require('dotenv').config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/generate-post", (req, res) => {
    res.render("postForm");
})

app.get("/generate-hashtags", (req, res) => {
    res.render("hashtagForm");
})

app.get("/generate-summary", (req, res) => {
    res.render("summaryForm");
})
app.get("/about-us", (req, res) => {
    res.render("about");
})
app.get("/why-linkedink", (req, res) => {
    res.render("why");
})
app.get("/privacy-policy", (req, res) => {
    res.render("privacy");
})
app.get("/terms", (req, res) => {
    res.render("terms");
})

app.post("/generate-post", async (req, res) => {
    const { topic } = req.body;
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'mistralai/mistral-7b-instruct',
            messages: [
                { role: 'system', content: 'You are a professional LinkedIn post writer.' },
                { role: 'user', content: `Write a professional LinkedIn post about: ${topic}. Add an emoji before starting the title text. Keep it formatted as a professional post with required spaces and newlines, also add newline before hashtags and don't add emojis in hashtags. Limit hashtags to 10 only. All this in approximately 100 words.` }
            ],
            max_tokens: 200,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'LinkedInk'
            }
        });


        const postContent = response.data.choices[0].message.content;
        res.render("postResult", { postContent: postContent.trim() });

    } catch (error) {
        console.error(error);
        res.render("error");
    }
})

app.post("/generate-hashtags", async (req, res) => {
    const { topic } = req.body;
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'mistralai/mistral-7b-instruct',
            messages: [
                { role: 'system', content: 'You are a professional LinkedIn content strategist.' },
                { role: 'user', content: `Give me a list of 21 trending and relevant LinkedIn hashtags for: ${topic}. Return the hashtags seperated by spaces in a single string without any commas.` }
            ],
            max_tokens: 300,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'LinkedInk'
            }
        });

        const hashtagData = response.data.choices[0].message.content;
        res.render("hashtagResult", { hashtags: hashtagData.trim() });

    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

app.post("/generate-summary", async (req, res) => {
    const { description } = req.body;
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'mistralai/mistral-7b-instruct',
            messages: [
                { role: 'system', content: 'You are a professional LinkedIn profile summary writer.' },
                { role: 'user', content: `Based on this information: ${description}, write a LinkedIn summary in approximately 200 words. Return the response as an object like: {"summary": "Your summary here..."} in a professional tone.` }
            ],
            max_tokens: 300,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'LinkedInk'
            }
        });

        const summaryData = JSON.parse(response.data.choices[0].message.content);
        res.render("summaryResult", { summary: summaryData.summary.trim() });

    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

//Error-404!
app.use((req, res) => {
    res.status(404).render('404');
});

module.exports = app;
module.exports.handler = serverless(app);