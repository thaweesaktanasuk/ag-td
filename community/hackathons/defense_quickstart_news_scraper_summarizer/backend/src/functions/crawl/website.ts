import { FunctionFailure, log } from "@restackio/ai/function";
import axios from "axios";
import * as iconv from "iconv-lite";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export const crawlWebsite = async ({
    url
}: { url: string }): Promise<{ result: string }> => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
        const encoding = contentType && contentType.includes('charset=')
            ? contentType.split('charset=')[1]
            : 'utf-8';
        const decodedData = iconv.decode(response.data, encoding);

        const dom = new JSDOM(decodedData, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (article) {
            return { result: article.textContent };
        } else {
            throw new Error("Failed to parse the main content");
        }
    } catch (error) {
        throw FunctionFailure.nonRetryable(`Error crawl website: ${error}`);
    }
};