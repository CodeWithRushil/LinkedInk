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
    const { topic, tone, length } = req.body;
    try {
        let lengthInstruction = "Keep the total post between 150-200 words.";
        if (length === "Short") lengthInstruction = "Keep the post very concise, under 100 words.";
        if (length === "Long") lengthInstruction = "Write a longer, story-driven post, around 250-350 words.";

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'google/gemini-2.5-flash',
            messages: [
                {
                    role: 'system',
                    content: `You are an elite LinkedIn ghostwriter who has studied thousands of viral LinkedIn posts. You understand the LinkedIn algorithm deeply: short punchy lines get more "see more" clicks, white space improves readability, and a strong hook in the first line is critical for engagement.

Your writing rules:
- Start with a bold, attention-grabbing hook line (use an emoji at the very start). This first line must create curiosity or make a surprising statement.
- Use short paragraphs (1-2 sentences max per paragraph).
- Add line breaks between every paragraph for readability.
- Include a personal story, insight, or lesson — not generic advice.
- End with a clear call-to-action or thought-provoking question to drive comments.
- Add exactly 5-8 highly relevant hashtags on a new line at the very end (no emojis in hashtags).
- ${lengthInstruction}
- Write in first person. Sound authentic and human — never robotic or corporate.
- Do NOT use markdown formatting like bold (**), italics (*), or headers (#). Use plain text only.
- Do NOT include any meta-commentary like "Here's your post" or "Sure!". Output ONLY the post itself.`
                },
                {
                    role: 'user',
                    content: `Write a high-engagement LinkedIn post about: ${topic}. Tone: ${tone || 'Professional'}.`
                }
            ],
            max_tokens: 600,
            temperature: 0.8
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
    const { topic, industry, audience } = req.body;
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'google/gemini-2.5-flash',
            messages: [
                {
                    role: 'system',
                    content: `You are a LinkedIn growth strategist who specializes in hashtag research and content discoverability. You understand how the LinkedIn algorithm surfaces content through hashtags and how different hashtag sizes (broad vs niche) affect reach.

Your rules:
- Generate exactly 21 hashtags.
- Mix 3 tiers: 7 broad/high-volume hashtags, 7 medium/industry-specific hashtags, and 7 niche/targeted hashtags specific to the exact topic and audience.
- Every hashtag must start with # and use PascalCase (e.g. #MachineLearning not #machinelearning).
- Return ONLY the hashtags separated by spaces on a single line — no numbering, no bullets, no explanations, no categories, no extra text.
- Do NOT include any meta-commentary like "Here are your hashtags" or "Sure!". Output ONLY the hashtags.`
                },
                {
                    role: 'user',
                    content: `Generate 21 optimized LinkedIn hashtags for: ${topic}. Industry: ${industry || 'General'}. Target Audience: ${audience || 'General Audience'}.`
                }
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
    const { description, experience, goal } = req.body;
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'google/gemini-2.5-flash',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional LinkedIn profile optimization expert who has written hundreds of high-converting LinkedIn "About" sections for professionals across all industries.

Your writing rules:
- Write in first person, in a warm yet professional tone.
- Open with a compelling one-line personal brand statement that captures who the person is and the value they bring.
- Highlight key skills, achievements, and passions naturally woven into a narrative — not a boring list.
- Include quantifiable achievements or impact where the input allows.
- Tailor the narrative to their experience level (e.g., highlight growth for entry-level, leadership/strategy for executives).
- End with a call to action or closing statement that aligns with their primary goal on LinkedIn.
- Keep it between 180-250 words.
- Use short paragraphs for readability (2-3 sentences each).
- Sound genuinely human and personable — not like a resume or a chatbot.
- Do NOT use markdown formatting like bold (**), italics (*), or headers (#). Use plain text only.
- Do NOT include any meta-commentary like "Here's your summary" or "Sure!". Output ONLY the summary itself.`
                },
                {
                    role: 'user',
                    content: `Write a professional LinkedIn "About" section based on this information: ${description}. Experience Level: ${experience || 'Mid-level Professional'}. Primary Goal: ${goal || 'Building Personal Brand'}.`
                }
            ],
            max_tokens: 500,
            temperature: 0.75
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'LinkedInk'
            }
        });

        const summaryContent = response.data.choices[0].message.content;
        res.render("summaryResult", { summary: summaryContent.trim() });

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