<a href="https://chathn.vercel.app">
  <img alt="Chat with Hacker News using natural language." src="/app/opengraph-image.png">
  <h1 align="center">ChatHN</h1>
</a>

<p align="center">
  Chat with Hacker News using natural language. Built with OpenAI Functions and Vercel AI SDK. 
</p>

<p align="center">
  <a href="https://news.ycombinator.com/item?id=36480570"><img src="https://img.shields.io/badge/Hacker%20News-255-%23FF6600" alt="Hacker News"></a>
  <a href="https://github.com/steven-tey/chathn/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/steven-tey/chathn?label=license&logo=github&color=f80&logoColor=fff" alt="License" />
  </a>
  <a href="https://github.com/steven-tey/chathn"><img src="https://img.shields.io/github/stars/steven-tey/chathn?style=social" alt="ChatHN's GitHub repo"></a>
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#setting-up-locally"><strong>Setting Up Locally</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a> ·
  <a href="#license"><strong>License</strong></a>
</p>
<br/>

## Introduction

ChatHN is an open-source AI chatbot that uses [OpenAI Functions](https://platform.openai.com/docs/guides/gpt/function-calling) and the [Vercel AI SDK](https://sdk.vercel.ai/docs) to interact with the [Hacker News API](https://github.com/HackerNews/API) with natural language.

https://github.com/steven-tey/chathn/assets/28986134/9c0ad554-f4e5-4e98-8771-5999ddf79235


## Setting Up Locally

To set up Novel locally, you'll need to clone the repository and set up the following environment variables:

- `OPENAI_API_KEY` – your OpenAI API key (you can get one [here](https://platform.openai.com/account/api-keys))

## Tech Stack

ChatFn is built on the following stack:
- [openai-function-calling-tools](https://github.com/JohannLai/openai-function-calling-tools) - a library to make calling OpenAI functions calling easier
- [Next.js](https://nextjs.org/) – framework
- [OpenAI Functions](https://platform.openai.com/docs/guides/gpt/function-calling) - AI completions
- [Vercel AI SDK](https://sdk.vercel.ai/docs) – AI streaming library
- [Vercel](https://vercel.com) – deployments
- [TailwindCSS](https://tailwindcss.com/) – styles

## Contributing

Here's how you can contribute:

- [Open an issue](https://github.com/steven-tey/novel/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/steven-tey/novel/pull) to add new features/make quality-of-life improvements/fix bugs.

## Author

- Steven Tey ([@Johannli](https://twitter.com/ProgramerJohann))

## License

Licensed under the MIT license.
