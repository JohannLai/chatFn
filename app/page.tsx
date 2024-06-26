"use client";

import { useRef } from "react";
import { useChat } from "ai/react";
import { FunctionCallHandler, Message, nanoid } from "ai";
import type { JSX } from "react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { GithubIcon, LoadingCircle, SendIcon, FunctionIcon } from "./icons";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";
import { Collapse } from "./collapse";

const examples = [
  "What time is it in New York?",
  "Show me the map of New York.",
  "You can touch the website JavaScript Context, please put a red square at the top left corner of the screen.",
  "Get me the top 5 stories on Hacker News in markdown table format. Use columns like title, link, score, and comments.",
  "What is the result of 100 * 100?",
];

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall,
  ) => {
    let parsedFunctionCallArguments = {} as any;
    const { name, arguments: args } = functionCall;
    if (args) {
      parsedFunctionCallArguments = JSON.parse(args);
    }

    console.log("functionCallHandler");
    console.log(functionCall, chatMessages);

    let result;

    if (name === "eval_code") {
      result = JSON.stringify(eval(parsedFunctionCallArguments.code));
    } else {
      const response = await fetch("/api/functions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(functionCall),
      });

      if (!response.ok) {
        toast.error("Something went wrong.");
        return;
      }

      result = await response.text();
    }

    return {
      messages: [
        ...chatMessages,
        {
          id: nanoid(),
          name: functionCall.name,
          role: "function" as const,
          content: result,
        },
      ],
    };
  };

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    experimental_onFunctionCall: functionCallHandler,
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        va.track("Rate limited");
        return;
      } else {
        va.track("Chat initiated");
      }
    },
    onError: (error) => {
      va.track("Chat errored", {
        input,
        error: error.message,
      });
    },
  });

  const disabled = isLoading || input.length === 0;

  const roleUIConfig: {
    [key: string]: {
      avatar: JSX.Element;
      bgColor: string;
      avatarColor: string;
      // eslint-disable-next-line no-unused-vars
      dialogComponent: (message: Message) => JSX.Element;
    };
  } = {
    user: {
      avatar: <User width={20} />,
      bgColor: "bg-white",
      avatarColor: "bg-black",
      dialogComponent: (message: Message) => (
        <ReactMarkdown
          className="prose mt-1 w-full break-words prose-p:leading-relaxed"
          remarkPlugins={[remarkGfm]}
          components={{
            a: (props) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      ),
    },
    assistant: {
      avatar: <Bot width={20} />,
      bgColor: "bg-gray-100",
      avatarColor: "bg-green-500",
      dialogComponent: (message: Message) => (
        <ReactMarkdown
          className="prose mt-1 w-full break-words prose-p:leading-relaxed"
          remarkPlugins={[remarkGfm]}
          components={{
            a: (props) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      ),
    },
    function: {
      avatar: <FunctionIcon className="w-[20px]" />,
      bgColor: "bg-gray-200",
      avatarColor: "bg-blue-500",
      dialogComponent: (message: Message) => (
        <div className="flex flex-col">
          <div>Result</div>
          <Collapse text={message.content} />
        </div>
      ),
    },
  };

  return (
    <main className="flex flex-col items-center justify-between pb-40">
      <div className="absolute top-5 hidden w-full justify-between px-5 sm:flex">
        <div className="rounded-lg p-2 text-2xl transition-colors duration-200 hover:bg-stone-100 sm:bottom-auto">
          🤖
        </div>
        <a
          href="/github"
          target="_blank"
          className="rounded-lg p-2 transition-colors duration-200 hover:bg-stone-100 sm:bottom-auto"
        >
          <GithubIcon />
        </a>
      </div>
      {messages.length > 0 ? (
        messages.map((message, i) => {
          return (
            <div
              key={i}
              className={clsx(
                "flex w-full items-center justify-center border-b border-gray-200 py-8",
                roleUIConfig[message.role].bgColor,
              )}
            >
              <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
                <div
                  className={clsx(
                    "p-1.5 text-white",
                    roleUIConfig[message.role].avatarColor,
                  )}
                >
                  {roleUIConfig[message.role].avatar}
                </div>
                {message.content === "" &&
                message.function_call != undefined ? (
                  typeof message.function_call === "object" ? (
                    <div className="flex flex-col">
                      <div>
                        Using{" "}
                        <span className="font-bold">
                          {message.function_call.name}
                        </span>{" "}
                        ...
                      </div>
                      <div className="text-sm text-gray-500">
                        {message.function_call.arguments}
                      </div>
                    </div>
                  ) : (
                    <div>{message.function_call}</div>
                  )
                ) : (
                  roleUIConfig[message.role].dialogComponent(message)
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="mx-5 mt-20 max-w-screen-md rounded-md border border-gray-200 sm:mx-0 sm:w-full">
          <div className="flex flex-col space-y-1 p-2 sm:p-10">
            <h1 className="text-lg font-semibold text-black">
              Welcome to ChatFn!
            </h1>
            <p className="text-gray-500">
              This is an{" "}
              <a
                href="https://github.com/JohannLai/chatFn"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black"
              >
                open-source
              </a>{" "}
              AI chatbot that uses{" "}
              <a
                href="https://github.com/JohannLai/openai-function-calling-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black"
              >
                OpenAI Functions Library
              </a>{" "}
              and{" "}
              <a
                href="https://sdk.vercel.ai/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black"
              >
                Vercel AI SDK
              </a>{" "}
              to play with OpenAI functions
            </p>
          </div>
          <div className="flex flex-col space-y-4 border-t border-gray-200 bg-gray-50 p-7 sm:p-10">
            {examples.map((example, i) => (
              <button
                key={i}
                className="rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                onClick={() => {
                  setInput(example);
                  inputRef.current?.focus();
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 flex w-full flex-col items-center space-y-3 bg-gradient-to-b from-transparent via-gray-100 to-gray-100 p-5 pb-3 sm:px-0">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative w-full max-w-screen-md rounded-xl border border-gray-200 bg-white px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
        >
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                formRef.current?.requestSubmit();
                e.preventDefault();
              }
            }}
            spellCheck={false}
            className="w-full pr-10 focus:outline-none"
          />
          <button
            className={clsx(
              "absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
              disabled
                ? "cursor-not-allowed bg-white"
                : "bg-green-500 hover:bg-green-600",
            )}
            disabled={disabled}
          >
            {isLoading ? (
              <LoadingCircle />
            ) : (
              <SendIcon
                className={clsx(
                  "h-4 w-4",
                  input.length === 0 ? "text-gray-300" : "text-white",
                )}
              />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400">
          Built with{" "}
          <a
            href="https://github.com/JohannLai/openai-function-calling-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            OpenAI Functions Calling Tools
          </a>{" "}
          and{" "}
          <a
            href="https://sdk.vercel.ai/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            Vercel AI SDK
          </a>
          .{" "}
          <a
            href="https://github.com/JohannLai/chatFn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center transition-colors hover:text-black"
          >
            View the repo <GithubIcon />
          </a>
        </p>
      </div>
    </main>
  );
}
