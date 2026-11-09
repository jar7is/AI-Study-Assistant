

import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: "API key is not configured."
            });
        }

        const { notes, style } = req.body || {};

        if (
            typeof notes !== "string" ||
            notes.trim() === "" ||
            notes.length > 12000
        ) {
            return res.status(400).json({
                error: "Please provide valid notes."
            });
        }

        const allowedStyles = [
            "simple",
            "exam",
            "detailed"
        ];

        if (!allowedStyles.includes(style)) {
            return res.status(400).json({
                error: "Invalid answer style."
            });
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const prompt = `
        You are StudyMate AI, a helpful study assistant.

        Create study material based only on the following notes:

        ${notes}

        Answer style: ${style}

        Generate:
        1. A clear and useful summary.
        2. Exactly 5 multiple-choice quiz questions.
        3. Exactly 5 flashcards.

        Make all answers accurate and based on the notes.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        summary: {
                            type: "STRING"
                        },
                        quiz: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    question: { type: "STRING" },
                                    options: {
                                        type: "ARRAY",
                                        items: { type: "STRING" }
                                    },
                                    answerIndex: { type: "INTEGER" },
                                    explanation: { type: "STRING" }
                                },
                                required: [
                                    "question",
                                    "options",
                                    "answerIndex",
                                    "explanation"
                                ]
                            }
                        },
                        flashcards: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    question: { type: "STRING" },
                                    answer: { type: "STRING" }
                                },
                                required: ["question", "answer"]
                            }
                        }
                    },
                    required: ["summary", "quiz", "flashcards"]
                }
            }
        });

        const result = JSON.parse(response.text);

        if (
            !result.summary ||
            result.quiz.length !== 5 ||
            result.flashcards.length !== 5 ||
            result.quiz.some(q =>
                q.options.length !== 4 ||
                q.answerIndex < 0 ||
                q.answerIndex > 3
            )
        ) {
            throw new Error("Invalid AI response format");
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error("Gemini API Error:", error);

        return res.status(500).json({
            error: "Unable to generate study material. Please try again."
        });
    }
}
