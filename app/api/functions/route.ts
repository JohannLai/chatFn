import {
  createCalculator,
  createClock,
  createWebBrowser,
  createGoogleCustomSearch,
  createShowPoisOnMap,
  createRequest,
} from "openai-function-calling-tools";

const [calculator] = createCalculator();
const [clock] = createClock();
const [request] = createRequest();
const [webbrowser] = createWebBrowser();
const [googleCustomSearch] =
  createGoogleCustomSearch({
    apiKey: process.env.GOOGLE_API_KEY || "",
    googleCSEId: process.env.GOOGLE_SEARCH_ENGINE_ID || "",
  });
const [showPoisOnMap] = createShowPoisOnMap({
  mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN || "",
});

export async function POST(req: Request) {
  const { name, arguments: args } = await req.json()
  const parsedArgs = JSON.parse(args)

  console.log({ name, parsedArgs })

  let result;

  switch (name) {
    case 'calculator':
      result = await calculator(parsedArgs)
      break;
    case 'clock':
      result = await clock(parsedArgs)
      break;
    case 'request':
      result = await request(parsedArgs)
      break;
    case 'webbrowser':
      result = await webbrowser(parsedArgs)
      break;
    case 'googleCustomSearch':
      result = await googleCustomSearch(parsedArgs)
      break;
    case 'showPoisOnMap':
      result = await showPoisOnMap(parsedArgs)
      break;
    default:
      return new Response("Function not found", {
        status: 418,
      });
  }

  return new Response(JSON.stringify(result), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });
}