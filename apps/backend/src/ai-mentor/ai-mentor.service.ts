import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiMentorService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.warn('NVIDIA_API_KEY is missing. AI Mentor will mock responses.');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey || 'mock',
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }

  async chat(messages: any[], mode: string = 'general') {
    if (process.env.NVIDIA_API_KEY === undefined) {
      return { 
        role: 'ai', 
        content: `MOCK MODE: Add NVIDIA_API_KEY to backend .env to enable Nemotron.`,
        mode 
      };
    }

    try {
      let systemPrompt = "You are a highly knowledgeable and supportive AI Mentor for UPSC Civil Services Exam aspirants. CRITICAL: Do NOT output your internal thinking process, scratchpad, or step-by-step reasoning. Output ONLY the final response directly to the user. Use standard Markdown formatting for bolding, bullet points, and tables. Do not escape markdown characters.";
      
      if (mode === 'eli5') {
        systemPrompt += " The user has requested ELI5 (Explain Like I'm 5) mode. Explain concepts very simply, using easy-to-understand analogies.";
      } else if (mode === 'mains') {
        systemPrompt += " The user has requested Mains Mode. Provide highly structured, analytical answers suitable for UPSC Mains format (Introduction, Body with points/subheadings, and Conclusion). Be rigorous and objective.";
      } else {
        systemPrompt += " Provide clear, accurate, and encouraging answers relevant to the UPSC syllabus.";
      }

      // Convert frontend messages to OpenAI format
      const formattedMessages = messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content
      }));

      // Prepend system prompt
      formattedMessages.unshift({ role: 'system', content: systemPrompt });

      const completion = await this.openai.chat.completions.create({
        model: "nvidia/nemotron-3.5-lightning-30b-a3b",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 4096,
      });

      const replyContent = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      return {
        role: 'ai',
        content: replyContent,
        mode: mode
      };
    } catch (error) {
      console.error('Error in AiMentorService:', error);
      throw new InternalServerErrorException('Failed to communicate with AI Mentor service');
    }
  }
}
