import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';
import fs from 'fs/promises';


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// TOOL DEFINITION

const saveFileTool = {
    name: "saveReportToFile",
    description: "Save any research report or text as local file(.txt or .md)",
    parameters: {
        type: Type.OBJECT,
        properties: {
            filename: {
                type: Type.STRING,
                description: "Name of file, e.g., 'report.txt' or 'bitcoin_analysis.md'",
            },
            content: {
                type: Type.STRING,
                description: "That whole content , we want to write in the file",
            },
        },
        required: ["filename", "content"]
    }
};

const wikiTool = {
    name: "getWikipediaSummary",
    description: "Fetch summary from wikipedia of any topic, thing of place",
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: "Name of topic , e.g., 'Taj Mahal' , 'Artificial Intelligence'"
            }
        },
        required: ["query"]
    }
};

const currencyTool = {
    name: "convertCurrency",
    description: "convert amount from one currency to other currency (e.g., USD to INR).",
    parameters: {
        type: Type.OBJECT,
        properties: {
            amount: {
                type: Type.NUMBER,
                description: "How much amount to convert",
            },
            from: {
                type: Type.STRING,
                description: "Source Currency Code, e.g., 'USD'"
            },
            to: {
                type: Type.STRING,
                description: "Target Currency Code, e.g., 'INR'"
            }
        },
        required: ["amount", "from", "to"]
    }
};

const cryptoTool = {
    name: "getCryptoPrice",
    description: "Fetch current USD price of any crypto currency",
    parameters: {
        type: Type.OBJECT,
        properties: {
            coin: {
                type: Type.STRING,
                description: "Crypto name, e.g., 'bitcoin'"
            },
        },
        required: ["coin"]
    },
};

//BACKEND FUNCTIONS

const saveReportToFile = async (filename, content) => {
    try {
        await fs.writeFile(filename, content, 'utf8');
        return { success: true, message: `File '${filename}' file saved successfully` };
    } catch (err) {
        return { success: false, error: "Error in file saving" };
    }
}


const getWikipediaSummary = async (query) => {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.extract) {
            return { title: data.title, summary: data.extract };
        }
        return{ error: "didn't find this topic on wikipedia."}
    } catch (err) {
        return { error: "getting error while fetching wikipedia."}
    }
}

const convertCurrency = async (amount, from, to) => {
    try {
        const url = `https://open.er-api.com/v6/latest/${from.toUpperCase()}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.result === "success" && data.rates[to.toUpperCase()]) {
            const rate = data.rates[to.toUpperCase()];
            const convertedAmount = amount * rate;
            return {
                from: from.toUpperCase(),
                to: to.toUpperCase(),
                original_amount: amount,
                converted_amount: convertedAmount.toFixed(2),
                rate: rate,
            };
        }
        return { error: "Currency Conversion fail." };
    } catch (err) {
        return { error: "Currency API error." };
    }
}

const getCryptoPrice = async (coin) => {
    try {
        const coinId = coin.toLowerCase();
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data[coinId]) {
            return { error: `Coin '${coin}' nahi mila.` };
        }
        return { coin: coinId, price_usd: data[coinId].usd };
    } catch (err) {
        return { error: "getting error while fetching crypto price."}
    }
}


const handleUserMessage = async (userPrompt) => {
console.log('User Message', userPrompt)

     const messages = [
        {role: "user", parts: [{text: userPrompt}]}
    ];

    let maxSteps = 5;
    let step = 0;

    while (step < maxSteps) {
        step++;
        console.log("steps: ",step)

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: messages, 
            config: {
                tools: [{ functionDeclarations: [wikiTool, currencyTool, cryptoTool, saveFileTool] }],
            },
        });

        if (response.candidates && response.candidates[0].content) {
            messages.push(response.candidates[0].content);
        }

        const functionCalls = response.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            console.log(`\n [Agent Thinking]: Tool trigger -> ${call.name}`)
            console.log("Arguments: ",call.args)

            let toolResult;
            if (call.name === "getWikipediaSummary") {
                toolResult = await getWikipediaSummary(call.args.query);
            } else if (call.name === "convertCurrency") {
                toolResult = await convertCurrency(call.args.amount, call.args.from, call.args.to);
            } else if (call.name === "saveReportToFile") {
                toolResult = await saveReportToFile(call.args.filename, call.args.content);
            } else if (call.name === "getCryptoPrice") {
                toolResult = await getCryptoPrice(call.args.coin);
            }

              console.log(`Tool Result: `, toolResult);

            messages.push({
                role: "user",
                parts: [{
                    functionResponse: {
                        name: call.name,
                        response: toolResult
                    }
                }]
            });
        } else {

            console.log(`\n Final Answer: ${response.text}\n`);
            break;
        }
    }

}


handleUserMessage("get history of bitcoin, convert current USD price of bitcoin to INR and generate a financial summary report")