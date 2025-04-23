import { step } from "@restackio/ai/workflow";
import * as functions from "../functions";


export async function rssDigest({ url = "https://www.pravda.com.ua/rss/", count = 2 }: { url: string, count: number }) {

    // Step 1: Fetch RSS feed
    const rssResponse: functions.RssItem[] = await step<typeof functions>({
    }).rssPull({
        url,
        count,
    });

    // Step 2: Crawl website content
    let websiteContent: { result: string }[] = [];
    await Promise.all(rssResponse.map(async (item) => {
        const response: { result: string } = await step<typeof functions>({
        }).crawlWebsite({
            url: item.link,
        });

        websiteContent.push(response);
    }));

    // Step 3: Very basic character split because OpenBabylon model has a token limit of 4096
    let splittedContent: string[] = [];
    await Promise.all(websiteContent.map(async (item) => {
        const response: { result: string[] } = await step<typeof functions>({
        }).splitContent({
            content: item.result,
        });

        splittedContent.push(...response.result);
    }));

    // // Step 4: LLM translation
    let translatedContent: { result: string }[] = [];
    await Promise.all(splittedContent.map(async (item) => {
        const response: { result: string } = await step<typeof functions>({
            taskQueue: 'llm',
        }).llmChat({
            userContent: `Only return the translated content string, no other text!! Translate the following content to English!!: ${item}.`,
        });

        translatedContent.push(response);
    }));

    // // Step 5: LLM summarization per translated chunk
    let summarizedContent: { result: string }[] = [];
    await Promise.all(translatedContent.map(async (item) => {
        const response: { result: string } = await step<typeof functions>({
            taskQueue: 'llm',
        }).llmChat({
            userContent: `Summarize the following content in maximum 1 sentence: ${item.result}.`,
        });

        summarizedContent.push(response);
    }));

    // Step 6: LLM Create a digest
    return await step<typeof functions>({
        taskQueue: 'llm',
    }).llmChat({
        userContent: `Summarize the following content as a daily digest, prioritize the most important information: ${summarizedContent.map((item) => item.result).join("\n")}`,
    });
}
