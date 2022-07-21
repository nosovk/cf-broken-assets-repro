import fs from 'fs';
import fg from 'fast-glob';
import { create } from 'xmlbuilder2';
import pkg from './package.json' assert { type: 'json' };

const getUrl = (url) => {
  const trimmed = url.slice(22).replace('index', '').replace('.html', '');
  return pkg.url + trimmed;
};

const filterRegexp = new RegExp('noindex');

async function createSitemap() {
  const sitemap = create({ version: '1.0' }).ele('urlset', {
    xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
  });

  const pages = await fg(['.svelte-kit/cloudflare/**/*.html']);
  const bytesToRead = 5000;
  const openTasks = [];
  const readTasks = [];
  pages.forEach((path) => {
    openTasks.push(fs.promises.open(path));
  });

  const openedPages = await Promise.all(openTasks);
  openedPages.forEach((filehandler) => {
    readTasks.push(
      filehandler.read({ buffer: Buffer.alloc(bytesToRead), position: 0, length: bytesToRead })
    );
  });

  const contents = await Promise.all(readTasks);

  const filteredPages = pages
    .map((path, index) => [path, contents[index].buffer.toString('utf8')])
    .filter(([path, content]) => !filterRegexp.test(content))
    .map(([path]) => path);

  filteredPages.forEach((page) => {
    const url = sitemap.ele('url');
    url.ele('loc').txt(getUrl(page));
    url.ele('changefreq').txt('weekly');
  });

  const xml = sitemap.end({ prettyPrint: true });

  console.log(process.cwd(), process.cwd() + '.svelte-kit/cloudflare/sitemap.xml');
  fs.writeFileSync('.svelte-kit/cloudflare/sitemap.xml', xml);
}

createSitemap();
