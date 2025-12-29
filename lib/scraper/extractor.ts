import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedAcquisition {
  peFirmName: string | null;
  acquiredCompanyName: string | null;
  acquisitionDate: string | null;
  dealAmount: string | null;
  location: string | null;
  relevanceScore: number; // 0-100
  summary: string;
}

export interface ExtractedArticle {
  title: string;
  summary: string;
  peFirmMentions: string[];
  brandMentions: string[];
  isRelevant: boolean;
  acquisitions: ExtractedAcquisition[];
}

const EXTRACTION_PROMPT = `You are an expert at extracting structured data about private equity acquisitions in the HVAC (heating, ventilation, air conditioning), plumbing, and electrical services industry.

Analyze the following article text and extract:
1. Any PE firm names mentioned (e.g., Apex Service Partners, Alpine Investors, Wrench Group, Redwood Services, Kohlberg, Gridiron Capital)
2. Any HVAC/plumbing/electrical company names that were acquired or are being discussed
3. Acquisition details if present (date, amount, location)
4. Whether this article is relevant to PE activity in the HVAC industry

Return your response as JSON in this exact format:
{
  "title": "Brief descriptive title for the article",
  "summary": "2-3 sentence summary of the article content",
  "peFirmMentions": ["List of PE firm names mentioned"],
  "brandMentions": ["List of HVAC/plumbing/electrical company names mentioned"],
  "isRelevant": true/false (is this about PE activity in HVAC/home services?),
  "acquisitions": [
    {
      "peFirmName": "Name of the acquiring PE firm or null",
      "acquiredCompanyName": "Name of the acquired company or null",
      "acquisitionDate": "YYYY-MM-DD format or null if unknown",
      "dealAmount": "Dollar amount as string (e.g., '$15M') or 'Undisclosed' or null",
      "location": "City, State of acquired company or null",
      "relevanceScore": 0-100 (how confident are you this is a real acquisition?),
      "summary": "One sentence describing this acquisition"
    }
  ]
}

Only include acquisitions where you have high confidence the information is accurate.
If the article is not about HVAC/plumbing/electrical or private equity, set isRelevant to false and return empty arrays.`;

export async function extractFromArticle(
  articleText: string,
  articleUrl?: string
): Promise<ExtractedArticle | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: EXTRACTION_PROMPT,
        },
        {
          role: "user",
          content: `Article URL: ${articleUrl || "Unknown"}\n\nArticle Text:\n${articleText.slice(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("No content in OpenAI response");
      return null;
    }

    const parsed = JSON.parse(content) as ExtractedArticle;
    return parsed;
  } catch (error) {
    console.error("Error extracting from article:", error);
    return null;
  }
}

export async function extractPEFirmInfo(
  pageText: string,
  firmName: string
): Promise<{
  brands: Array<{
    name: string;
    location?: string;
    website?: string;
  }>;
  description: string | null;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are extracting portfolio company information from a private equity firm's website.
Extract the list of portfolio companies/brands they own in the HVAC, plumbing, or electrical services space.

Return JSON in this format:
{
  "brands": [
    {
      "name": "Company Name",
      "location": "City, State or null",
      "website": "URL or null"
    }
  ],
  "description": "Brief description of the PE firm's focus in home services"
}`,
        },
        {
          role: "user",
          content: `PE Firm: ${firmName}\n\nPage Content:\n${pageText.slice(0, 10000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { brands: [], description: null };
    }

    const parsed = JSON.parse(content) as {
      brands: Array<{ name: string; location?: string | null; website?: string | null }>;
      description: string | null;
    };

    // Transform null to undefined for optional fields
    return {
      brands: parsed.brands.map((b) => ({
        name: b.name,
        location: b.location ?? undefined,
        website: b.website ?? undefined,
      })),
      description: parsed.description,
    };
  } catch (error) {
    console.error("Error extracting PE firm info:", error);
    return { brands: [], description: null };
  }
}

export async function classifyArticleRelevance(
  title: string,
  snippet: string
): Promise<{ isRelevant: boolean; confidence: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Determine if this article is relevant to private equity activity in the HVAC, plumbing, or electrical services industry.
Return JSON: { "isRelevant": true/false, "confidence": 0-100 }

Relevant topics include:
- PE firm acquisitions of HVAC/plumbing/electrical companies
- HVAC company mergers and acquisitions
- Home services industry consolidation
- PE-backed platforms in residential services

Not relevant:
- General HVAC product news
- DIY home improvement
- Commercial HVAC equipment
- Unrelated industries`,
        },
        {
          role: "user",
          content: `Title: ${title}\n\nSnippet: ${snippet}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { isRelevant: false, confidence: 0 };
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error classifying article:", error);
    return { isRelevant: false, confidence: 0 };
  }
}
