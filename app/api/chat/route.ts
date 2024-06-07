import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionFunctions } from 'openai-edge/types/api'

import {
  createCalculator,
  createClock,
  createWebBrowser,
  createGoogleCustomSearch,
  createRequest,
  createShowPoisOnMap,
  createReverseGeocode
} from "openai-function-calling-tools";

const [, calculatorSchema] = createCalculator();
const [, clockSchema] = createClock();
const [, requestSchema] = createRequest();
const [, webbrowserSchema] = createWebBrowser();
const [, googleCustomSearchSchema] =
  createGoogleCustomSearch({
    apiKey: process.env.GOOGLE_API_KEY || "",
    googleCSEId: process.env.GOOGLE_SEARCH_ENGINE_ID || "",
  });
const [, showPoisOnMapSchema] = createShowPoisOnMap({
  mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN || "",
});
const [, reverseGeocodeSchema] = createReverseGeocode({
  mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN || "",
});

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: process.env.BASE_PATH
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

const functions: ChatCompletionFunctions[] = [
  calculatorSchema,
  clockSchema,
  requestSchema,
  webbrowserSchema,
  showPoisOnMapSchema,
  reverseGeocodeSchema,
  googleCustomSearchSchema,
  {
    name: 'eval_code',
    description: 'Execute javascript code with eval().',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: `Javascript code that will be directly executed via eval(). 
           The Code cannot attach the global scope and context, and will be executed in a sandboxed environment, you must put the variables or context you want into the code to use in the arguments object.
           Do not use backticks in your response.
           DO NOT include any newlines in your response, and be sure to provide only valid JSON when providing the arguments object.
           The output of the eval() will be returned directly by the function.`
        }
      },
      required: ['code']
    }
  }
];

export async function POST(req: Request) {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  ) {
    const ip = req.headers.get("x-forwarded-for");
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(30, "1 d"),
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

  const { messages, function_call } = await req.json()

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
    functions,
    function_call
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
