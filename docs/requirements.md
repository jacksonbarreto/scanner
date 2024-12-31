# System Requirements

The purpose of this system is creating a service which analyses the HTTP Security Headers in compliance with OWASP guidelines. [View more](https://www.linkedin.com/pulse/meeting-standards-http-header-requirements-owasp-compliance-/)

# Functional Requirements

| ID   | Functional Requirement                                                                                                       |
|------|------------------------------------------------------------------------------------------------------------------------------|
| RF1  | The system must verify that all HTTP responses contain the `Content-Type` header and, for content types `text/*`, `*/+xml`, and `application/xml`, ensure that a safe character set is specified (e.g., UTF-8, ISO-8859-1). |
| RF2  | The system must ensure that all API responses include the `Content-Disposition: attachment; filename="api.json"` header (or appropriate filename based on content type), to force file downloads when necessary. |
| RF3  | The system must ensure that all HTTP responses include the `Content-Security-Policy (CSP)` header to mitigate vulnerabilities related to injections such as HTML, DOM, JSON, and JavaScript. |
| RF4  | The system must verify that all responses contain the `X-Content-Type-Options: nosniff` header to prevent browsers from incorrectly interpreting content types. |
| RF5  | The system must verify that all responses include the `Strict-Transport-Security` header with the policy `max-age=15724800; includeSubdomains`, ensuring communication is made via HTTPS only, across all subdomains. |
| RF6  | The system must ensure that all responses include a suitable `Referrer-Policy` header, such as `no-referrer` or `same-origin`, to protect user privacy when sharing the referrer information. |
| RF7  | The system must verify that the web application's content cannot be embedded on third-party sites by default, using the `Content-Security-Policy: frame-ancestors` or `X-Frame-Options` headers, allowing embedding only where necessary. |
| RF8  | The system must ensure that the application server accepts only the HTTP methods required by the application/API, including pre-flight `OPTIONS`, and logs/alerts for invalid requests. |
| RF9  | The system must verify that the `Origin` header is not used for authentication or access control decisions, as this header can be easily manipulated by attackers. |
| RF10 | The system must ensure that the Cross-Origin Resource Sharing (CORS) `Access-Control-Allow-Origin` header uses a strict allow list of trusted domains and subdomains and does not support the "null" origin. |
