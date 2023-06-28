import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
// import { functions, runFunction } from "./functions";
import {
  createCalculator,
  createClock,
  createWebBrowser,
  createGoogleCustomSearch,
  createRequest,
} from "openai-function-calling-tools";

const { calculator, calculatorSchema } = createCalculator();
const { clock, clockSchema } = createClock();
const { request, requestSchema } = createRequest();
const { webbrowser, webbrowserSchema } = createWebBrowser();
const { googleCustomSearch, googleCustomSearchSchema } =
  createGoogleCustomSearch({
    apiKey: process.env.GOOGLE_API_KEY || "",
    googleCSEId: process.env.GOOGLE_SEARCH_ENGINE_ID || "",
  });

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

export async function POST(req: Request) {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  ) {
    const ip = req.headers.get("x-forwarded-for");
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(
      `chatfn_ratelimit_${ip}`,
    );

    if (!success) {
      return new Response("You have reached your request limit for the day.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }

  const { messages } = await req.json();

  const functions: {
    // eslint-disable-next-line no-unused-vars
    [key: string]: (params: any) => any;
  } = {
    calculator,
    clock,
    request,
    webbrowser,
    googleCustomSearch
  };

  // check if the conversation requires a function call to be made
  const initialResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages,
    functions: [
      calculatorSchema,
      clockSchema,
      requestSchema,
      webbrowserSchema,
      googleCustomSearchSchema
    ],
    function_call: "auto",
  });
  const initialResponseJson = await initialResponse.json();
  const initialResponseMessage = initialResponseJson?.choices?.[0]?.message;

  let finalResponse;

  if (initialResponseMessage.function_call) {
    const { name, arguments: args }: {
      name: string;
      arguments: string;
    } = initialResponseMessage.function_call;

    const fn = functions[name];
    const parsedArgs = JSON.parse(args);
    const functionResponse = await fn(parsedArgs);

    console.log('name:', name);
    console.log('parsedArgs:', args);
    console.log('function response:', functionResponse);

    finalResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      stream: true,
      messages: [
        ...messages,
        initialResponseMessage,
        {
          role: "function",
          name: initialResponseMessage.function_call.name,
          content: JSON.stringify({ result: functionResponse }),
        },
      ],
    });

    console.log('final response:', finalResponse);

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(finalResponse);
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } else {
    // if there's no function call, just return the initial response
    // but first, we gotta convert initialResponse into a stream with ReadableStream
    const chunks = initialResponseMessage.content.split(" ");
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          const bytes = new TextEncoder().encode(chunk + " ");
          controller.enqueue(bytes);
          await new Promise((r) =>
            setTimeout(
              r,
              // get a random number between 10ms and 30ms to simulate a random delay
              Math.floor(Math.random() * 20 + 10),
            ),
          );
        }
        controller.close();
      },
    });
    return new StreamingTextResponse(stream);
  }
}
