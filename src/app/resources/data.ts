import { ResourceCategorySchema } from "@/lib/data/schema";

export const resourceCategories = [
  {
    title: "Learn to Code",
    resources: [
      {
        name: "DevRoadmaps",
        url: "https://roadmap.sh",
        description: "Roadmaps for every tech stack",
      },
      {
        name: "W3Schools",
        url: "https://www.w3schools.com",
        description: "Basic HTML/CSS/JS tutorials",
      },
      {
        name: "freeCodeCamp",
        url: "https://www.freecodecamp.org",
        description: "Free coding courses with projects",
      },
      {
        name: "Exercism",
        url: "https://exercism.org",
        description: "Language-agnostic challenges with mentor feedback",
      },
      {
        name: "GitHub Skills",
        url: "https://skills.github.com",
        description: "Interactive Git tutorials",
      },
      {
        name: "GitHub Docs",
        url: "https://docs.github.com",
        description: "Git and GitHub documentation",
      },
      {
        name: "Coursera",
        url: "https://www.coursera.org",
        description: "College-level courses for skill-building",
      },
      {
        name: "edX",
        url: "https://www.edx.org",
        description: "College-level courses from top universities",
      },
    ],
  },
  {
    title: "Interview Prep",
    resources: [
      {
        name: "LeetCode",
        url: "https://leetcode.com",
        description: "Algorithm and data structure problems",
      },
      {
        name: "NeetCode",
        url: "https://neetcode.io",
        description: "Curated LeetCode problem lists",
      },
      {
        name: "Tech Interview Handbook",
        url: "https://www.techinterviewhandbook.org",
        description: "Comprehensive interview prep guide",
      },
      {
        name: "CodeSignal",
        url: "https://codesignal.com",
        description: "Practice interviews with real-world scenarios",
      },
      {
        name: "Pramp",
        url: "https://www.pramp.com",
        description: "Free peer-to-peer mock interviews",
      },
    ],
  },
  {
    title: "Job Search",
    resources: [
      {
        name: "Levels.fyi",
        url: "https://www.levels.fyi",
        description: "Salary data by company and location",
      },
      {
        name: "Handshake",
        url: "https://joinhandshake.com",
        description: "Job and internship platform for college students",
      },
      {
        name: "Jobright AI",
        url: "https://jobright.ai",
        description: "AI-powered job matching and application assistance",
      },
    ],
  },
  {
    title: "AI Tools",
    resources: [
      {
        name: "Claude",
        url: "https://claude.ai",
        description: "Anthropic's AI assistant for coding and reasoning",
      },
      {
        name: "ChatGPT",
        url: "https://chat.openai.com",
        description: "OpenAI's conversational AI for various tasks",
      },
      {
        name: "Gemini",
        url: "https://gemini.google.com",
        description: "Google's AI assistant for creative and technical tasks",
      },
      {
        name: "GLM",
        url: "https://open.bigmodel.cn",
        description: "Zhipu AI's large language model",
      },
      {
        name: "Grok",
        url: "https://grok.x.ai",
        description: "xAI's AI assistant with real-time knowledge",
      },
      {
        name: "Perplexity",
        url: "https://perplexity.ai",
        description: "AI-powered search engine with citations",
      },
      {
        name: "Lovable",
        url: "https://lovable.dev",
        description: "AI-powered full-stack development tool",
      },
      {
        name: "Bolt",
        url: "https://bolt.new",
        description: "AI web app builder for rapid prototyping",
      },
      {
        name: "GitHub Copilot",
        url: "https://github.com/features/copilot",
        description: "AI-powered coding assistant integrated into IDEs",
      },
      {
        name: "Cursor",
        url: "https://cursor.sh",
        description: "AI-native code editor for faster development",
      },
      {
        name: "Windsurf",
        url: "https://windsurf.ai",
        description: "AI code editor with intelligent code completion",
      },
      {
        name: "v0.dev",
        url: "https://v0.dev",
        description: "Vercel's AI UI generator for rapid prototyping",
      },
      {
        name: "Midjourney",
        url: "https://midjourney.com",
        description: "AI image generation for creative projects",
      },
      {
        name: "DALL-E",
        url: "https://openai.com/dall-e-3",
        description: "OpenAI's text-to-image AI generator",
      },
      {
        name: "Notion AI",
        url: "https://notion.so/product/ai",
        description: "AI-powered productivity and note-taking",
      },
      {
        name: "Suno",
        url: "https://suno.ai",
        description: "AI music generation for creative projects",
      },
      {
        name: "ElevenLabs",
        url: "https://elevenlabs.io",
        description: "AI voice generation and text-to-speech",
      },
      {
        name: "Runway",
        url: "https://runwayml.com",
        description: "AI video generation and editing tools",
      },
      {
        name: "Jasper",
        url: "https://jasper.ai",
        description: "AI writing assistant for marketing and content",
      },
      {
        name: "Copy.ai",
        url: "https://copy.ai",
        description: "AI copywriting tool for marketing copy",
      },
    ],
  },
];

ResourceCategorySchema.array().parse(resourceCategories);
