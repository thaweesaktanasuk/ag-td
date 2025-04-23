import { FunctionFailure, log } from "@restackio/ai/function";
import axios from "axios";
import { parseString } from "xml2js";
import { promisify } from "util";
import * as iconv from "iconv-lite";

interface RssInput {
    url: string;
    count?: number;
}

export interface RssItem {
    title: string;
    link: string;
    description: string;
    category?: string;
    creator?: string;
    pub_date?: string;
    content_encoded?: string;
}

export async function rssPull(input: RssInput): Promise<RssItem[]> {
    try {
        // Fetch the RSS feed
        const response = await axios.get(input.url, { responseType: 'arraybuffer' });

        // Determine the encoding from the response headers or assume a default
        const contentType = response.headers['content-type'];
        const encoding = contentType && contentType.includes('charset=')
            ? contentType.split('charset=')[1]
            : 'utf-8'; // Default to utf-8 if not specified

        // Decode the response data using iconv-lite with the detected encoding
        const decodedData = iconv.decode(Buffer.from(response.data), encoding);

        // Parse the RSS feed
        const parseXml = promisify(parseString);
        const result: any = await parseXml(decodedData);

        const items: RssItem[] = result.rss.channel[0].item.map((item: any) => ({
            title: item.title?.[0] || '',
            link: item.link?.[0] || '',
            description: item.description?.[0] || '',
            category: item.category?.[0] || '',
            creator: item["dc:creator"]?.[0] || '',
            pub_date: item.pubDate?.[0] || '',
            content_encoded: item["content:encoded"]?.[0] || ''
        }));

        // Limit the number of items based on input.count
        const maxCount = input.count ?? items.length;
        const limitedItems = items.slice(0, maxCount);

        return limitedItems;

    } catch (error) {
        log.error("rssPull function failed", { error });
        throw FunctionFailure.nonRetryable(`Error fetching RSS feed: ${error}`);
    }
}