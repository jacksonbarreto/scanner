import { AnalysisResult } from "../../../../common/lib/models/analysisResult";
import ILogger from "../../../../common/lib/log/logger.interface";
import {Rating} from "../../../../common/lib/models/rating";
import { HeaderAnalyserResult } from "../HeaderAnalyser";

// src/types/index.ts

// Enum para os headers de segurança recomendados
export enum SecurityHeader {
    XContentTypeOptions = 'X-Content-Type-Options',
    XFrameOptions = 'X-Frame-Options',
    StrictTransportSecurity = 'Strict-Transport-Security',
    ContentSecurityPolicy = 'Content-Security-Policy',
    XSSProtection = 'X-XSS-Protection',
    ReferrerPolicy = 'Referrer-Policy',
    PermissionsPolicy = 'Permissions-Policy',
    FeaturePolicy = 'Feature-Policy',
  }
  
  // Enum para as recomendações de RFC
  export enum RFCRecommendation {
    MUST_NOT = 0,
    NOT_RECOMMENDED = 1,
    MAY = 2,
    RECOMMENDED = 3,
    MUST = 4
  }
  
  // Interface para a requisição de análise
  export interface AnalysisRequest {
    url: string;          // URL para análise
    type: string;         // Tipo da análise (ex: "SECURITY_HEADERS")
    headers?: Record<string, string>;  // Headers adicionais (opcional)
  }
  
  // Interface para o resultado da análise de headers de segurança
  export interface SecurityHeadersResult extends AnalysisResult {
      headers: HeaderAnalyserResult;
  }
  
  // Adicionando a configuração dos headers de segurança
export interface SecurityHeadersScannerConfig { 
    logger: ILogger;
    //calculateScore: (partialResult: SecurityHeadersResult) => Rating;
  }
  