import { clerkClient } from "@clerk/express";
import axios from "axios";
import sql from "../configs/db.js"; 
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import { PDFParse } from 'pdf-parse';


const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

const wordCountToMaxTokens = (wordCount) =>
    Math.min(Math.ceil(Number(wordCount) * 1.5), 8192);

const TEXT_MODELS = [
    GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
].filter((model, index, models) => model && models.indexOf(model) === index);

const BLOG_TITLE_MODELS = [
    GEMINI_MODEL,
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
].filter((model, index, models) => model && models.indexOf(model) === index);

const buildBlogTitlePrompt = (topic, category) =>
    `Create 10 original blog post titles.

Topic: ${topic}
Category: ${category || "General"}

Requirements:
- Make every title use a different angle and sentence structure.
- Avoid repeating the same template with only the topic or category changed.
- Mix formats such as guide, listicle, curiosity, mistakes, trends, personal experience, and practical tips.
- Keep titles specific, natural, and engaging.
- Return only a Markdown numbered list.`;

const generateGeminiText = async ({
    prompt,
    models,
    temperature = 0.9,
    maxOutputTokens = 700,
}) => {
    let lastError;
    let partialContent = null;

    for (const model of models) {
        try {
            const { data } = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature,
                        maxOutputTokens,
                        // Keep output tokens for the answer (thinking models otherwise truncate early)
                        thinkingConfig: { thinkingBudget: 0 },
                    },
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": GEMINI_API_KEY,
                    },
                }
            );

            const candidate = data?.candidates?.[0];
            const content = candidate?.content?.parts
                ?.map((part) => part.text)
                .filter(Boolean)
                .join("\n")
                .trim();

            if (content) {
                const finishReason = candidate?.finishReason;
                const isComplete = !finishReason || finishReason === "STOP";
                const isUsefulPartial =
                    finishReason === "MAX_TOKENS" && content.length >= 400;

                if (isComplete || isUsefulPartial) {
                    return { content, model, finishReason };
                }

                // Truncated teaser / blocked — keep trying other models
                partialContent = content;
                lastError = new Error(
                    `Gemini model ${model} stopped early (${finishReason || "unknown"}).`
                );
                continue;
            }

            lastError = new Error(`Gemini model ${model} returned an empty response.`);
        } catch (error) {
            const status = error.response?.status;
            const providerMessage = error.response?.data?.error?.message;
            // Some models reject thinkingConfig — retry once without it
            if (
                providerMessage?.toLowerCase().includes("thinking") ||
                providerMessage?.toLowerCase().includes("unknown name")
            ) {
                try {
                    const { data } = await axios.post(
                        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                        {
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature,
                                maxOutputTokens,
                            },
                        },
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "x-goog-api-key": GEMINI_API_KEY,
                            },
                        }
                    );

                    const content = data?.candidates?.[0]?.content?.parts
                        ?.map((part) => part.text)
                        .filter(Boolean)
                        .join("\n")
                        .trim();

                    if (content) {
                        return { content, model };
                    }
                } catch (retryError) {
                    const retryMessage = retryError.response?.data?.error?.message;
                    lastError = new Error(
                        retryMessage ||
                            (retryError.response?.status
                                ? `Gemini API error ${retryError.response.status}`
                                : retryError.message)
                    );
                    continue;
                }
            }

            lastError = new Error(
                providerMessage ||
                    (status ? `Gemini API error ${status}` : error.message)
            );
        }
    }

    if (partialContent) {
        return { content: partialContent, model: models[0] };
    }

    throw lastError || new Error("No Gemini model returned content.");
};

export const generateArticle = async(req,res) =>{
    try {
        if (!GEMINI_API_KEY) {
            return res.json({
                success: false,
                message: "Gemini API key is not configured. Add GEMINI_API_KEY to server/.env",
            });
        }

        const {userId} = req.auth();
        const {prompt,length} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({
                success : false,
                message : "Limit reached. Upgrade to continue."
            })

        }

        const { content } = await generateGeminiText({
            prompt: `You are a helpful assistant.\n\n${prompt}`,
            models: TEXT_MODELS,
            temperature: 0.7,
            maxOutputTokens: wordCountToMaxTokens(length),
        });

        if (!content) {
            return res.json({
                success: false,
                message: "AI model returned an empty response. Try again or use a different GEMINI_MODEL.",
            });
        }

        await sql`insert into creations (user_id,prompt,content,type) values(${userId},${prompt},${content},'article')`;

        if(plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({
            success : true,
            content
        })
        
    } catch (error) {
        console.log(error.message);
        res.json({success : false,message : error.message})
        
        
    }

}
export const generateBlogTitle = async(req,res) =>{
    try {
        if (!GEMINI_API_KEY) {
            return res.json({
                success: false,
                message: "Gemini API key is not configured. Add GEMINI_API_KEY to server/.env",
            });
        }
        
        const {userId} = req.auth();
        const {prompt, topic, category = "General"} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;
        const cleanTopic = topic?.trim();
        const cleanPrompt = prompt?.trim() || (cleanTopic ? buildBlogTitlePrompt(cleanTopic, category) : "");

        if (!cleanPrompt) {
            return res.json({
                success: false,
                message: "Topic is required to generate blog titles.",
            });
        }

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({
                success : false,
                message : "Limit reached .Upgrade to continue"
            })

        }

        const { content, model } = await generateGeminiText({
            prompt: cleanPrompt,
            models: BLOG_TITLE_MODELS,
        });

        if (!content) {
            return res.json({
                success: false,
                message: "AI model returned an empty response. Try again or use a different GEMINI_MODEL.",
            });
        }

        await sql`insert into creations (user_id,prompt,content,type) values(${userId},${cleanPrompt},${content},'blog-title')`;

        if(plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({
            success : true,
            content,
            model
        })
        
    } catch (error) {
        console.log(error.message);
        res.json({success : false,message : error.message})
        
        
    }

}
export const generateImage = async(req,res) =>{
    try {
        
        const {userId} = req.auth();
        const {prompt,publish} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({
                success : false,
                message : "Limit reached .Upgrade to continue"
            })

        }

        const form = new FormData()
        form.append('prompt', prompt);
        const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1',form,{
            headers : {    'x-api-key': process.env.CLIPDROP_API},
            responseType : "arraybuffer",
        });

        const base64Image = `data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`;

       const {secure_url} = await cloudinary.uploader.upload(base64Image);


        await sql`insert into creations (user_id,prompt,content,type,publish) values(${userId},${prompt},${secure_url},'image', ${publish ?? false})`;

        // if(plan !== 'premium'){
        //     await clerkClient.users.updateUserMetadata(userId, {
        //         privateMetadata: {
        //             free_usage: free_usage + 1
        //         }
        //     });
        // }

        res.json({
            success : true,
            content : secure_url    
        })
        
    } catch (error) {
        console.log(error.message);
        res.json({success : false,message : error.message})
        
        
    }

}
export const RemoveImageBackground = async(req,res) =>{
    try {
        
        const {userId} = req.auth();
        const image = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!image) {
            return res.json({
                success : false,
                message : "Please upload an image"
            })
        }

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({
                success : false,
                message : "Limit reached .Upgrade to continue"
            })

        }

        

       const {secure_url} = await cloudinary.uploader.upload(image.path,{
          transformation :[
            {

                effect : 'background removal',
                background_removal : 'remove_the_background'

            }
          ]
       });


        await sql`insert into creations (user_id,prompt,content,type) values(${userId},'Remove background from image',${secure_url},'image')`;

        // if(plan !== 'premium'){
        //     await clerkClient.users.updateUserMetadata(userId, {
        //         privateMetadata: {
        //             free_usage: free_usage + 1
        //         }
        //     });
        // }

        res.json({
            success : true,
            content : secure_url    
        })
        
    } catch (error) {
        console.log(error.message);
        res.json({success : false,message : error.message})
        
        
    }

}

export const RemoveImageObject = async(req,res) =>{
    try {
        
        const {userId} = req.auth();
        const image = req.file;
        const { object } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!image) {
            return res.json({
                success : false,
                message : "Please upload an image"
            })
        }

        if (!object || !String(object).trim()) {
            return res.json({
                success : false,
                message : "Please describe the object to remove"
            })
        }

        const objectDesc = String(object).trim();

        if (objectDesc.split(" ").length > 4) {
            return res.json({
                success : false,
                message : "Please keep the object description short (max 4 words)"
            })
        }

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({
                success : false,
                message : "Limit reached .Upgrade to continue"
            })

        }

        

       const { public_id } = await cloudinary.uploader.upload(image.path);

       const imageurl = cloudinary.url(public_id,{
        transformation : [{effect : `gen_remove:prompt_${objectDesc}`}],
        resource_type : 'image'
       })


        await sql`insert into creations (user_id,prompt,content,type) values(${userId},${`Removed ${objectDesc} from image`},${imageurl},'image')`;

        // if(plan !== 'premium'){
        //     await clerkClient.users.updateUserMetadata(userId, {
        //         privateMetadata: {
        //             free_usage: free_usage + 1
        //         }
        //     });
        // }

        res.json({
            success : true,
            content : imageurl    
        })
        
    } catch (error) {
        console.log(error.message);
        res.json({success : false,message : error.message})
        
        
    }

}
export const ResumeReview = async(req,res) =>{
    try {
        if (!GEMINI_API_KEY) {
            return res.json({
                success: false,
                message: "Gemini API key is not configured. Add GEMINI_API_KEY to server/.env",
            });
        }

        const {userId} = req.auth();
        const resume = req.file;
        const plan = req.plan;

        if (!resume) {
            return res.json({
                success : false,
                message : "Please upload a resume"
            })
        }

        if(plan !== 'premium'){
            return res.json({
                success : false,
                message : "This feature is only available for  premium subscriptions"
            })

        }

        if(resume.size > 5 *1024 * 1024){
            return res.json({
                success : false,
                message : "Resume file size exceeds allowed size (5MB)."
            })
        }

        const dataBuffer = fs.readFileSync(resume.path);

        const parser = new PDFParse({ data: dataBuffer });
        const pdfData = await parser.getText();
        await parser.destroy();

        const resumeText = (pdfData.text || "").trim();
        if (!resumeText) {
            return res.json({
                success: false,
                message: "Could not extract text from this PDF. Try a text-based resume (not a scanned image).",
            });
        }

        // Cap input size so the model has room for a full written review
        const clippedResume =
            resumeText.length > 12000
                ? `${resumeText.slice(0, 12000)}\n\n[Resume truncated for length]`
                : resumeText;

        const prompt = `You are an expert resume reviewer and career coach.

Review the resume below and write a complete, actionable critique.

Rules:
- Do NOT write a short preamble or teaser. Start immediately with the first heading.
- Cover every section listed below with specific, concrete feedback (cite examples from the resume).
- Use clean Markdown only (## headings, bullet lists, bold for emphasis).
- Be thorough enough to be useful (aim for a full review, not a summary blurb).

Required Markdown structure:

## Overall Assessment
(2-4 sentences on how strong the resume is and the main takeaway)

## Strengths
- at least 4 specific strengths

## Areas for Improvement
- at least 5 specific, prioritized improvements

## Content & Impact
- feedback on bullets, metrics, achievements, and relevance

## Grammar, Clarity & Formatting
- issues found and how to fix them

## Recommended Next Steps
- 4-6 concrete edits the candidate should make next

Resume:
"""
${clippedResume}
"""`;

        const { content } = await generateGeminiText({
            prompt,
            models: TEXT_MODELS,
            temperature: 0.6,
            maxOutputTokens: 4096,
        });

        if (!content) {
            return res.json({
                success: false,
                message: "AI model returned an empty response. Try again or use a different GEMINI_MODEL.",
            });
        }

        // Guard against near-empty / truncated teaser responses
        if (content.length < 400) {
            return res.json({
                success: false,
                message: "The AI returned an incomplete review. Please try again.",
            });
        }

        await sql`insert into creations (user_id,prompt,content,type) values(${userId},'Review the uploaded resume',${content},'resume-review')`;

        res.json({
            success : true,
            content : content    
        })
        
    } catch (error) {
        console.log(error.message);
        res.json({success : false,message : error.message})
        
        
    }

}
