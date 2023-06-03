import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
const router = express.Router();
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
import axios from 'axios';

router.post('/hello-world', async (request, response) => {
    const hello = request.body.prompt;
    // Ask Gpt which is the objective that best matches the user's input
    const result = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Eres una API, con base en el texto: "${hello}" Genera un saludo amable de bienvenida.`,
        temperature: 0.7,
        max_tokens: 250,
    });
    return response.send({data: result.data.choices[0].text});
});

router.post('/ask', async (request, response) => {
	// Specify to the python script that the data path is the same as this endpoint
	const question = request.body.question;
    const context = request.body.context;
	// using axios, make a post request to process.env.AI_URL/ask with the prompt as post parameter named "question"
	const result = await axios.post(`${process.env.AI_URL}/ask`, {question: question, context: context});
	// return the result of the request
	return response.send(result.data);
});

export { router };


// Install primsa and generate the ncesarry files command: npx prisma init
