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
    origin: '*',
    titles: title,
  });

  const url = `${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    const content = page.revisions?.[0]?.slots?.main['*'] || page.revisions?.[0]['*'];
    return content;
  } catch (error) {
    console.error('Error fetching page:', title, error);
  }
}

export async function fetchWikiPageHTML(title) {
  const endpoint = 'https://wiki.teriock.com/api.php';
  const baseWikiUrl = 'https://wiki.teriock.com';

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
      let html = data.parse.text['*'];

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const links = doc.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/index.php/')) {
          link.setAttribute('href', baseWikiUrl + href);
          link.setAttribute('target', '_blank');
        }
      });

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
  const LIMIT = 500;
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
        origin: '*',
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

    return members;
  } catch (error) {
    console.error('Error fetching category members:', category, error);
    return [];
  }
}
