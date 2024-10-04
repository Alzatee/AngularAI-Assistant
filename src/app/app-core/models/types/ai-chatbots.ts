import { TypeAIChatBots } from "../enums/type-ai-chatbots";

export type TypeAIChatBot = TypeAIChatBots.Gemini | TypeAIChatBots.Gpt | TypeAIChatBots.Claude;

export type AIChatBots = {
    type: TypeAIChatBot,
}