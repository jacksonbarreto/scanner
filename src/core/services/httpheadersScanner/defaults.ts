import { SecurityHeader } from './types';
import Logger from "../../../../common/lib/log/logger";

export const GET_LOGGER_DEFAULT: Function = () => Logger.getInstance();

export const HTTP_SECURITY_HEADERS_DEFAULT = {
  [SecurityHeader.XContentTypeOptions]: { recommendation: "MUST", value: "nosniff" },
  [SecurityHeader.XFrameOptions]: { recommendation: "MUST", value: "DENY" },
  [SecurityHeader.StrictTransportSecurity]: { recommendation: "MUST", value: "max-age=31536000; includeSubDomains" },
  [SecurityHeader.ContentSecurityPolicy]: { recommendation: "MUST", value: "default-src 'self'" },
  [SecurityHeader.XSSProtection]: { recommendation: "MAY", value: "0" },
  [SecurityHeader.ReferrerPolicy]: { recommendation: "MAY", value: "no-referrer-when-downgrade" },
  [SecurityHeader.PermissionsPolicy]: { recommendation: "MAY", value: "geolocation=(self)" },
  [SecurityHeader.FeaturePolicy]: { recommendation: "MAY", value: "microphone 'none'" }
};
