import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

const genAI = new GoogleGenerativeAI(process.env.YOUR_API_KEY || "");

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    //console.log("Prompt:", prompt);

    const geminiStream = await genAI
      .getGenerativeModel({ model: "gemini-pro" })
      .generateContentStream(
        prompt + "   \n Explain the given code in detail and what it is trying to do."
      );

    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(geminiStream);
    //console.log(stream)

    console.log(new StreamingTextResponse(stream));
    // Respond with the stream

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log("Error while geenrating propmts: aman", error);
    return Response.json({
      error: "Error while geenrating propmts dolly",
    });
  }
}
