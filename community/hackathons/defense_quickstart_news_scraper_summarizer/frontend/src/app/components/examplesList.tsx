export type Example = {
  name: string;
  description: string;
  integrations: string[];
  workflowName: string;
  input: Record<string, unknown>;
};

export const examples = [
  {
    name: "RSS Digest Example",
    description: "Example workflow to generate a daily digest from an RSS feed",
    integrations: ["openbabylon"],
    workflowName: "rssDigest",
    input: { url: "https://www.pravda.com.ua/rss/" },
  },
];
