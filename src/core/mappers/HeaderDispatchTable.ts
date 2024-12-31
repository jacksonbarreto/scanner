export type Header = string

function analyseContentSecurityPolicy(header: Header): boolean {
    const re = /default-src/;
    return header.length > 0 && re.test(header);
}


function analyseContentType(header:Header) {
    const textContentTypes = [
        new RegExp('text/*'),
        new RegExp('.*/\\*.*\\+xml'),
        new RegExp('application/xml')
    ]
    if(textContentTypes.some(regex => regex.test(header))) {

        const charset = header.split(';')[1].toLowerCase()
        return charset.includes('utf-8') || charset.includes('iso-8859-1')
    }
    return true
}
function analyseContentDisposition(header:Header) {
    const contentDisposition = header
    const re = new RegExp('attachment[;][ ]filename[ ]*[=][ ]*\"(.*)\"')
    if(contentDisposition) {
        return re.test(contentDisposition)
    }
    return false
}

function analyseXContentTypeOptions(header:Header) {
    return header.includes('nosniff')
}

function analyseStrictTransportSecurity(header:Header) {
    //return header.length > 0 && header.includes('includeSubDomains') && header.includes('preload')
    if (!header || header.trim() === "") {
        return false;
    }
    // Regex para validar o formato do Strict-Transport-Security
    const re = /^max-age=\d+(; includeSubDomains)?(; preload)?$/;
    return re.test(header.trim())
}

function analyseReferrerPolicy(header:Header) {
    return header.length > 0
}

function analyseAllowedMethods(header:Header) {
    if(header.length > 0 ) {
        const allowedMethods = ["GET", "POST", "OPTIONS"]
        const methodsInHeader = header.split(",").map(method => method.trim())
        const invalidMethods = methodsInHeader.filter(method => !allowedMethods.includes(method))

        return invalidMethods.length === 0
    }

    return false
}

function analyseAccessControlAllowOrigin(header:Header) {
    const hasHeader = header.length > 0 
    const isOWASPCompliance = (!header.includes('*') || !header.includes('null')) 
    return hasHeader && isOWASPCompliance
}

function analyseXXSSProtection(header:Header) {
    if (!header || header.trim() === "") {
        return false;
    }
    // Regex para validar os valores do X-XSS-Protection
    const re = /^0(; mode=block)?$/;
    return re.test(header.trim());
}
function analyseXFrameOptions(header: string): boolean {
    // Regex para validar os valores do X-Frame-Options
    const re = /^(DENY|SAMEORIGIN)$/i; 
    return re.test(header.trim());
}

function analysePermissionsPolicy(header: string): boolean {
    // Verifica se o header não está vazio
    if (!header || header.trim() === "") {
        return false;
    }

    // Regex para validar o formato básico do Permissions-Policy
    const re = /^[a-zA-Z-]+=([()]+|\*|\".*\"|'.*')(,\s*[a-zA-Z-]+=([()]+|\*|\".*\"|'.*'))*$/;

    return re.test(header.trim());
}

function analyseClearSiteData(header: string): boolean {
    // Verifica se o header não está vazio
    if (!header || header.trim() === "") {
        return false;
    }

    // Regex para validar o formato do Clear-Site-Data
    const re = /^([a-zA-Z-]+(, )?)+$/;

    return re.test(header.trim());
}

function analyseXPermittedCrossDomainPolicies(header: string): boolean {
    // Verifica se o header não está vazio
    if (!header || header.trim() === "") {
        return false;
    }

    // Regex para validar o formato do X-Permitted-Cross-Domain-Policies
    const re = /^(none|master-only|by-content-type|by-ftp-filename|all)$/;

    return re.test(header.trim());
}

function analyseCrossOriginEmbedderPolicy(header: string): boolean {
    // Verifica se o header não está vazio
    if (!header || header.trim() === "") {
        return false;
    }

    // Regex para validar o formato do Cross-Origin-Embedder-Policy
    const re = /^(require-corp|unsafe-none)$/;

    return re.test(header.trim());
}

function analyseCrossOriginOpenerPolicy(header: string): boolean {
    // Verifica se o header não está vazio
    if (!header || header.trim() === "") {
        return false;
    }

    // Regex para validar o formato do Cross-Origin-Opener-Policy
    const re = /^(same-origin|same-origin-allow-popups|unsafe-none)$/;

    return re.test(header.trim());
}

function analyseCrossOriginResourcePolicy(header: string): boolean {
    // Verifica se o header não está vazio
    if (!header || header.trim() === "") {
        return false;
    }

    // Regex para validar o formato do Cross-Origin-Resource-Policy
    const re = /^(same-site|same-origin|cross-origin)$/;

    return re.test(header.trim());
}

function analyseCacheControl(header: Header) {
    if (!header || header.trim() === "") {
        return false;
    }

    // Regex para validar boas práticas do Cache-Control
    const re = /^(no-store|no-cache|must-revalidate|max-age=\d+)(,\s*(no-store|no-cache|must-revalidate|max-age=\d+))*$/;
    
    return re.test(header.trim());
}


function analyseXDownloadOptions(header: Header): boolean {
    // Verifica se o cabeçalho não está vazio e se contém 'noopen'
    return header.trim().toLowerCase() === 'noopen';
}


export const executeForHeader: Record<string, (header:Header) => boolean> = {
    'content-type': analyseContentType,
    'content-disposition': analyseContentDisposition,
    'content-security-policy': analyseContentSecurityPolicy,    // <-- ok
    'x-content-type-options': analyseXContentTypeOptions,       // <-- ok
    'strict-transport-security': analyseStrictTransportSecurity, // <-- ok
    'referrer-policy': analyseReferrerPolicy,                   // <-- ok
    "allow": analyseAllowedMethods,
    "access-control-allow-origin": analyseAccessControlAllowOrigin,
    'x-xss-protection': analyseXXSSProtection,                  // <-- deprecated ; set to 0 or don't use
    'x-frame-options': analyseXFrameOptions,                    // <-- ok
    'permissions-policy': analysePermissionsPolicy,             // <-- new
    'clear-site-data': analyseClearSiteData,                    // <-- new
    'x-permitted-cross-domain-policies': analyseXPermittedCrossDomainPolicies,           // <-- ok
    'cross-origin-embedder-policy': analyseCrossOriginEmbedderPolicy,                // <-- ok
    'cross-origin-opener-policy': analyseCrossOriginOpenerPolicy,     // <-- ok
    'cross-origin-resource-policy': analyseCrossOriginResourcePolicy,  // <-- ok
    'cache-control': analyseCacheControl,         //ok
    'X-Download-Options': analyseXDownloadOptions //ok
}


//missing
// clear-site-data - good
// x-permitted-cross-domain-policies - good
// Cross-Origin-Embedder-Policy	- good
// Cross-Origin-Opener-Policy - good
// Cross-Origin-Resource-Policy - good

//----------------------------------------

// deprecated
// x-xss-protection
// feature-policy
// Expect-CT
// Public-Key-Pins