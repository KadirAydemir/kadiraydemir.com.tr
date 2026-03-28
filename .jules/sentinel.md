## 2026-02-13 - Weak URL Validation in BrowserApp
**Vulnerability:** The `BrowserApp` component used `url.includes('linkedin.com/in/kadir-aydemir')` to validate URLs, which could be bypassed by malicious URLs containing the substring (e.g., in query parameters).
**Learning:** Simple string matching (`includes`, `indexOf`) is insufficient for security validation of URLs. Attackers can manipulate URL components (query params, fragments, subdomains) to include the required string while pointing to a different origin.
**Prevention:** Always use the `URL` API to parse and validate specific components like `hostname` and `pathname`. Use an allowlist approach for domains.
