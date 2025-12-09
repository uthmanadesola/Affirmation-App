import { pipeline } from "@xenova/transformers";

let generator: any = null;

const localAffirmations: Record<string, string[]> = {
    motivation: [
        "You have the power to create a positive change in your life and the lives of others.",
        "Every step forward is a step closer to your goals.",
    ],
    encouragement: [
        "You are strong and capable of overcoming any challenge.",
        "You are worthy of love and respect.",
        "You are deserving of success and happiness.",
    ],
    inspiration: [
        "You are a valuable and unique individual.",
        "You are capable of achieving anything you set your mind to.",
        "You are deserving of love and respect.",
        "You are worthy of success and happiness.",
    ],
};

export const generateAffirmation = async (category: string = "motivation", mood: string = "positive"  
): Promise<string> => {
    try {
        //ai model lAZY LOAD FOR 30 SECONDS
        if (!generator) {
            console.log("Loading AI model (distilgpt2)...");
            generator = await pipeline("text-generation", "Xenova/distilgpt2");
            console.log("AI model loaded.");
        }

        const prompt = `Generate a ${mood} affirmation for ${category} category.`;

        const output = await generator(prompt, {
            max_new_tokens: 50,
            temperature: 0.7,
            do_sample: true,
            repetition_penalty: 1.2,
        });

        let affirmation = output[0].generated_text;

        // Remove the prompt from the output
        affirmation = affirmation.replace(prompt, '').trim();

        // Try to extract text between quotes if present
        const startIndex = affirmation.indexOf('"');
        const endIndex = affirmation.indexOf('"', startIndex + 1);

        if (startIndex !== -1 && endIndex > startIndex) {
            return affirmation.substring(startIndex + 1, endIndex);
        }

        // Fallback: get the first sentence
        const firstSentence = affirmation.split(/[.\n]/)[0]?.trim();
        return firstSentence || affirmation.substring(0, 100);
    } catch (error) {
        console.error('AI Affirmation generation failed', error);

        const fallbacks = localAffirmations[category] || localAffirmations.motivation;
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
};