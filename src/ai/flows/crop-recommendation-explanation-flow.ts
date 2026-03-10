'use server';
/**
 * @fileOverview This file implements a Genkit flow that generates a concise explanation
 * for a crop recommendation based on user-provided soil and climate parameters
 * and the ideal conditions for the recommended crop.
 *
 * - cropRecommendationExplanation - A function that provides the explanation.
 * - CropRecommendationExplanationInput - The input type for the explanation function.
 * - CropRecommendationExplanationOutput - The return type for the explanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SoilParametersSchema = z.object({
  nitrogen: z.number().describe('Nitrogen level in mg/kg.'),
  phosphorus: z.number().describe('Phosphorus level in mg/kg.'),
  potassium: z.number().describe('Potassium level in mg/kg.'),
  temperature: z.number().describe('Average temperature in degrees Celsius.'),
  humidity: z.number().describe('Average humidity in percentage.'),
  ph: z.number().describe('pH level of the soil.'),
  rainfall: z.number().describe('Average rainfall in mm.'),
});

const IdealConditionsSchema = z.object({
  nitrogen: z.string().describe('Ideal nitrogen range (e.g., "60-100 mg/kg").'),
  phosphorus: z.string().describe('Ideal phosphorus range.'),
  potassium: z.string().describe('Ideal potassium range.'),
  temperature: z.string().describe('Ideal temperature range (e.g., "20-30°C").'),
  humidity: z.string().describe('Ideal humidity range.'),
  ph: z.string().describe('Ideal pH range.'),
  rainfall: z.string().describe('Ideal rainfall range.'),
});

const CropRecommendationExplanationInputSchema = z.object({
  cropName: z.string().describe('The name of the recommended crop.'),
  userParameters: SoilParametersSchema.describe(
    'The user-provided soil and climate parameters.'
  ),
  idealConditions: IdealConditionsSchema.describe(
    'The ideal soil and climate conditions for the recommended crop.'
  ),
});
export type CropRecommendationExplanationInput = z.infer<
  typeof CropRecommendationExplanationInputSchema
>;

const CropRecommendationExplanationOutputSchema = z.object({
  explanation: z.string().describe('A concise explanation for the crop recommendation.'),
});
export type CropRecommendationExplanationOutput = z.infer<
  typeof CropRecommendationExplanationOutputSchema
>;

export async function cropRecommendationExplanation(
  input: CropRecommendationExplanationInput
): Promise<CropRecommendationExplanationOutput> {
  return cropRecommendationExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropRecommendationExplanationPrompt',
  input: { schema: CropRecommendationExplanationInputSchema },
  output: { schema: CropRecommendationExplanationOutputSchema },
  prompt: `You are an expert agronomist providing a concise explanation for a crop recommendation.

The recommended crop is: {{{cropName}}}.

User-provided soil and climate parameters:
Nitrogen: {{{userParameters.nitrogen}}} mg/kg
Phosphorus: {{{userParameters.phosphorus}}} mg/kg
Potassium: {{{userParameters.potassium}}} mg/kg
Temperature: {{{userParameters.temperature}}} °C
Humidity: {{{userParameters.humidity}}} %
pH Level: {{{userParameters.ph}}}
Rainfall: {{{userParameters.rainfall}}} mm

Ideal conditions for {{{cropName}}}:
Nitrogen: {{{idealConditions.nitrogen}}}
Phosphorus: {{{idealConditions.phosphorus}}}
Potassium: {{{idealConditions.potassium}}}
Temperature: {{{idealConditions.temperature}}}
Humidity: {{{idealConditions.humidity}}}
pH Level: {{{idealConditions.ph}}}
Rainfall: {{{idealConditions.rainfall}}}

Based on these parameters, provide a concise, easy-to-understand explanation of why {{{cropName}}} is recommended. Highlight how the user's parameters align with the crop's ideal conditions and mention any notable deviations or perfect matches. Focus on the most significant factors. Keep the explanation under 150 words.
`,
});

const cropRecommendationExplanationFlow = ai.defineFlow(
  {
    name: 'cropRecommendationExplanationFlow',
    inputSchema: CropRecommendationExplanationInputSchema,
    outputSchema: CropRecommendationExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
