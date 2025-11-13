import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AEO (Answer Engine Optimization) and SEO consultant specializing in improving AI visibility and citation weight. Analyze the provided product data and generate specific, actionable recommendations to improve:

1. AI Visibility Score (current presence in AI model responses)
2. Citation Weight (quality and authority of citations)
3. SEO Health (technical optimization)
4. Content Depth (comprehensiveness and relevance)

Provide concrete, implementable suggestions with expected impact levels.`;

    const userPrompt = `Analyze this product and provide optimization recommendations:

Product: ${productData.name}
Category: ${productData.category}
Current AI Visibility: ${productData.visibility}%
SEO Health Score: ${productData.seoHealth}%
AI Mentions: ${productData.mentions}
Citations: ${productData.citations}
Broken Links: ${productData.brokenLinks}

Generate 5-8 specific recommendations with:
- Clear action items
- Expected impact (low/medium/high)
- Implementation difficulty (easy/moderate/hard)
- Estimated improvement in visibility percentage
- Priority level (critical/high/medium/low)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_optimization_recommendations",
              description: "Generate structured optimization recommendations for improving AI visibility",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string", enum: ["low", "medium", "high"] },
                        difficulty: { type: "string", enum: ["easy", "moderate", "hard"] },
                        estimatedImprovement: { type: "string" },
                        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                        category: { type: "string", enum: ["content", "seo", "citations", "technical"] },
                        actionItems: {
                          type: "array",
                          items: { type: "string" }
                        }
                      },
                      required: ["title", "description", "impact", "difficulty", "estimatedImprovement", "priority", "category", "actionItems"],
                      additionalProperties: false
                    }
                  },
                  summary: { type: "string" },
                  projectedScore: { type: "number" }
                },
                required: ["recommendations", "summary", "projectedScore"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_optimization_recommendations" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(recommendations),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in optimize-content function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
