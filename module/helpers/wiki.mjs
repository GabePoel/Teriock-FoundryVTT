export function openWikiPage(title) {
  const baseWikiUrl = 'https://wiki.teriock.com';
  const pageUrl = `${baseWikiUrl}/index.php/${encodeURIComponent(title)}`;
  window.open(pageUrl, '_blank');
}

export async function fetchWikiPageContent(title) {
  const endpoint = 'https://wiki.teriock.com/api.php';

  const params = new URLSearchParams({
    action: 'query',
    prop: 'revisions',
    rvprop: 'content',
    format: 'json',
    origin: '*', // Needed for CORS
    titles: title,
  });

  const url = `${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    // Depending on the MediaWiki version, you might need to adapt this:
    const content = page.revisions?.[0]?.slots?.main['*'] || page.revisions?.[0]['*'];

    console.log(content);
    return content;
  } catch (error) {
    console.error('Error fetching page:', error);
  }
}

export async function fetchWikiPageHTML(title) {
  const endpoint = 'https://wiki.teriock.com/api.php';
  const baseWikiUrl = 'https://wiki.teriock.com'; // base URL for fixing links

  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    format: 'json',
    origin: '*',
    prop: 'text',
  });

  const url = `${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.parse && data.parse.text) {
      let html = data.parse.text['*']; // HTML string

      // Now fix internal links
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Find all <a> tags
      const links = doc.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/index.php/')) {
          link.setAttribute('href', baseWikiUrl + href);
          link.setAttribute('target', '_blank'); // optional: open in new tab
        }
      });

      // Serialize the fixed HTML back to a string
      const fixedHtml = doc.body.innerHTML;

      return fixedHtml;
    } else {
      console.error('No parsed HTML found:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching HTML:', error);
    return null;
  }
}

export async function fetchCategoryMembers(category) {
  const endpoint = 'https://wiki.teriock.com/api.php';
  const LIMIT = 500; // MediaWiki API limit
  let members = [];
  let cmcontinue = null;

  try {
    do {
      const params = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: `Category:${category}`,
        cmlimit: LIMIT,
        format: 'json',
        origin: '*', // Needed for CORS
      });

      if (cmcontinue) {
        params.append('cmcontinue', cmcontinue);
      }

      const url = `${endpoint}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.query?.categorymembers) {
        members.push(...data.query.categorymembers);
      }

      cmcontinue = data.continue?.cmcontinue;
    } while (cmcontinue);

    console.log(members);
    return members;
  } catch (error) {
    console.error('Error fetching category members:', error);
    return [];
  }
}

