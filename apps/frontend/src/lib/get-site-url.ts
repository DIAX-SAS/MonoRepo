export function getSiteURL(subdomain = ''): string {
  const hostname = ['diax.website', 'localhost'][1]; // Change index for environment

  // Start with a protocol for the URL to avoid errors
  const baseProtocol = hostname === 'localhost' ? 'http' : 'https';
  const baseUrl = `${baseProtocol}://${hostname}`;

  const url = new URL(baseUrl);

  if (hostname === 'localhost') {
    url.hostname = 'localhost'; // Explicitly set localhost
    url.port = subdomain === 'backend' ? '3000' : ''; // Set port for backend or default
  } else {
    // Handle subdomains for production
    if (subdomain) {
      url.hostname = `${subdomain}.${url.hostname}`;
    }
  }

  // Ensure trailing slash
  if (!url.pathname.endsWith('/')) {
    url.pathname += '/';
  }

  return url.toString();
}
