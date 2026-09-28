# Search indexing and AI discovery for itsparam.in

## What this implementation does

- Sets the homepage title to **Parampreet Singh Portfolio | AI Engineer | Community Builder - itsparam.in**.
- Gives `/resume` and `/walloffame` their own titles, descriptions, canonical URLs, social previews and structured data.
- Describes About, Community, Teaching, Projects, Work, Gurmat Darbar and Contact using structured data tied to their real anchors. Each of the four project cards also has a direct anchor.
- Connects Parampreet Singh, Param, Param302 and Param3021 with official social profiles. The public reference explains the contextual phrases Param Python, Param IITM and Param IITMBS without claiming that broad terms uniquely identify this person.
- Keeps the existing social, playlist and talk redirects. The sitemap contains only the three indexable HTML pages.
- Serves `/agents.md`, `/llms.txt` and `/llms-full.txt` with `X-Robots-Tag: noindex, follow`. They remain directly retrievable but are excluded from the sitemap. The full reference and its resume section read the same published content as `/resume`; drafts, account details and private management data are not serialized. The response is not cached at the CDN, while the published-content query uses the existing invalidated application cache.
- Sends `noindex, nofollow` headers on management pages and API responses. Management pages have no public profile structured data. The login URL stays crawlable so a crawler can actually read `noindex`; private data remains behind authentication. Disallowing the login in robots.txt would prevent compliant crawlers from seeing its exclusion header. [Google's guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- Replaces large on-page images with WebP copies while preserving originals, social preview PNGs and icons used by installable apps. Run `npm run images:optimize` after updating source images. New gallery files automatically use optimized copies when present in the generated manifest.

## What search engines control

Titles are preferences, not commands. Engines can shorten or rewrite them. Google generates sitelinks automatically. `/#about`, `/#projects`, `/#community`, `/#teaching`, `/#gurmat-darbar` and `/#contact` are sections of the same document; they cannot each have a different HTML title. They can be useful jump links in results. [Google sitelinks](https://developers.google.com/search/docs/appearance/sitelinks), [title links](https://developers.google.com/search/docs/appearance/title-link)

The requested instant redirects at `/yt`, `/linkedin`, `/x`, `/github`, `/mlsessions`, `/pythonsessions` and `/python1liners` take people to external platforms. Those destinations are the primary indexable documents; the shortcuts cannot reliably retain independent itsparam.in titles. Genuine, useful HTML pages would be required to make those local URLs independently indexable. This implementation preserves the chosen redirect behavior.

A `noindex` agents file cannot simultaneously be promised a top ranking in search-backed AI results. It is a convenience for tools that retrieve it directly. Indexed HTML pages remain the foundation of search visibility. Google says no special AI text file or markup is required or used for its generative search features. [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

## 1. Deploy and verify

Deploy this change through the site's normal deployment workflow before submitting URLs. These instructions do not deploy or submit anything automatically.

Check the production URLs:

| URL | Expected |
| --- | --- |
| `https://itsparam.in/` | 200, requested title, canonical homepage, indexable |
| `https://itsparam.in/resume` | 200, own title/canonical, current resume |
| `https://itsparam.in/walloffame` | 200, own title/canonical, public learner feedback |
| `https://itsparam.in/sitemap.xml` | Only the three HTML pages above |
| `https://itsparam.in/robots.txt` | Public pages and AI reference files are crawlable |
| `https://itsparam.in/agents.md` | 200 Markdown, current public resume, `X-Robots-Tag: noindex, follow` |
| `/llms.txt`, `/llms-full.txt` | 200 text, same noindex policy |
| `/admin` and nested management URLs | `X-Robots-Tag: noindex, nofollow, nosnippet, noimageindex`; login has no public profile JSON-LD |
| Social/playlist/talk shortcuts | Existing permanent redirects |

Ensure HTTP and www aliases consistently redirect to `https://itsparam.in`. Check the host/CDN configuration; canonical tags do not replace those redirects. Ensure the production domain is not behind preview authentication, a bot challenge or a blanket noindex rule.

Use [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/) after deployment. Not every valid schema type is eligible for a Google visual enhancement. Check mobile loading in [PageSpeed Insights](https://pagespeed.web.dev/). Smaller image source sizes do not by themselves guarantee a particular performance score.

## 2. Google

1. Open [Google Search Console](https://search.google.com/search-console). Add or select the `itsparam.in` Domain property. Complete DNS TXT verification if necessary. Alternatively, an HTTPS URL-prefix property can use the existing verification meta tag if it belongs to your account.
2. Open **Sitemaps**, submit `https://itsparam.in/sitemap.xml`, and confirm that it is fetched successfully.
3. Use **URL Inspection** for the homepage, `/resume` and `/walloffame`. Run **Test live URL**, verify the canonical and indexability, then choose **Request indexing** where available. Do not submit fragment URLs, redirects or `/agents.md` as separate pages.
4. Monitor **Page indexing**, **Crawl stats** and **Performance**. Check the queries actually bringing impressions before making further changes. A sitemap submission or indexing request does not guarantee indexing or ranking.
5. If the management URL was already indexed, use Search Console's **Removals** tool for temporary hiding while Google recrawls the durable noindex header. Do not block its crawl before that header is processed.

[Google sitemap submission guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## 3. Bing, DuckDuckGo and IndexNow

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters/). Import the verified Search Console property or verify the domain directly. Existing `msvalidate.01` metadata is preserved; confirm that it matches your account.
2. Submit `https://itsparam.in/sitemap.xml` in **Sitemaps**. Inspect the same three public HTML URLs and request submission where available. [Bing sitemap guidance](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed)
3. Optionally set up **IndexNow** for future changes: generate a key, host the matching UTF-8 `<key>.txt` file at the domain root, then submit only changed public URLs using the protocol. A successful response means receipt, not indexing. Never submit management URLs or noindex reference files. This change does not create a key or submit requests. [IndexNow protocol](https://www.indexnow.org/documentation)
4. DuckDuckGo largely sources traditional web links from Bing and also has its own crawler. Keep DuckDuckBot access open and complete Bing indexing; do not expect a separate Google-style submission workflow to force DuckDuckGo results. [DuckDuckGo sources](https://duckduckgo.com/duckduckgo-help-pages/results/sources)

## 4. AI search and agent tools

- **ChatGPT search:** keep `OAI-SearchBot` able to fetch public pages. The wildcard robots rule permits it. If the CDN blocks bots, check the official crawler IP ranges rather than trusting user-agent strings alone. `GPTBot` training preferences are separate from search eligibility; permitting training is not required for search. `ChatGPT-User` is used for some user-initiated retrievals. [Official OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
- **Claude:** keep `Claude-SearchBot` and `Claude-User` able to access public sources, including through the CDN. Training crawling (`ClaudeBot`) is separate. [Anthropic crawler documentation](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- **Google AI search:** use the Google indexing steps and normal search fundamentals. There is no separate registration performed by this project for Google AI features. [Google AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- **Devin, DeepSeek, Sarvam, Gemini and other assistants:** retrieval depends on each product and its search provider. This implementation offers ordinary crawlable HTML and directly fetchable Markdown; it does not claim a universal submission endpoint or ranking mechanism. For a specific task, give the tool `https://itsparam.in/agents.md` or `/resume` as a source. Hosting a web `agents.md` is not equivalent to installing repository-level coding-agent instructions.
- Link the portfolio and resume from your GitHub profile, YouTube channel description, LinkedIn, X and relevant community/event profiles. Keep the name, handles and biography consistent. These are manual profile updates; this change does not modify external accounts.
- Evaluate retrieval with a small set of specific questions, such as “Who is Parampreet Singh, Codex Ambassador in New Delhi?” and “Where are Parampreet Singh's Python sessions?” Check cited URLs and factual accuracy. Generic “Python” or “Param” searches have many legitimate competing interpretations.

## Maintenance

- `npm run test:seo`: checks indexable URL boundaries, redirects, public reference fields, JSON-LD escaping and image assets.
- `npm run test:seo:http -- https://itsparam.in`: checks deployed response headers, HTML metadata, schema, anchors, redirects and image delivery. Omit the URL to test a local production server on port 3100. It also saves a local public Markdown preview under `output/seo/agents.md`.
- `npm run lint` and `npm run build`: validate the application before deployment.
- `npm run images:optimize`: regenerate optimized copies and their manifest after source-image changes. Keep the generated files in version control.
- Publish resume changes through the existing editor. The HTML resume and Markdown reference share the published source. Check both after publishing; a draft must not appear in either.
- Do not add fabricated review ratings, invisible FAQ answers, fake search actions, keyword-filled hidden text or current timestamps as sitemap modification dates.
