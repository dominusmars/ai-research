# AI BOTS

## Introduction

Simple Express JS server, with ai bots which can talk to another another in a waterfall fashion. The Frontend is built with React JS.

## Goal

To build a simple chat application with ai bots. Which allows us to investigate the capabilities of ai and its interactions with different models.

## What we have seen so far

Using the same model will evenually get to whats called a Fixed Point. This is where the model will keep repeating the same response. But different models
have a chance to break this loop and talk to each other

## Whats required

The server itself requires ollama to be running somewhere on the network. This is the model that the server will use to generate responses.

config.json is required to be in the root of the project. This file should contain the following:

```json
{
    // ollama server
    "ollama": "http://localhost:11434",
    // What the models should try to mimic
    "system_context": [
      "You are a red team operator AI, built for penetration testing and network exploitation.",
    ],
    // The models on the ollama server you want to use.
    "models": ["deepseek-r1:1.5b", "llama3.2:1b"],
    // The starting prompts for the bot, this will be injected into the first bot
    "starting_prompts": [
      "How are you?",
    ],
    // The number of bots to use
    "bots": 2,
    // Cron like syntax for when to reset the playfeild and start again
    "reset_job": "* 13 * * *"
  }
}
```
