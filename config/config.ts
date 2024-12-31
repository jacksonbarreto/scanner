import {join} from 'path';
import {readFileSync} from "node:fs";
import dotenv from 'dotenv';

function replaceEnvPlaceholders(config: any): any {
    if (typeof config === 'string') {
        return config.replace(/\${(.*?)}/g, (match, p1) => {
            const envVar = process.env[p1];
            if (process.env.hasOwnProperty(p1)) {
                return process.env[p1] || '';
            } else {
                throw new Error(`Environment variable ${p1} is not set`);
            }
        });
    } else if (Array.isArray(config)) {
        return config.map(item => replaceEnvPlaceholders(item));
    } else if (typeof config === 'object' && config !== null) {
        const newConfig: any = {};
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                newConfig[key] = replaceEnvPlaceholders(config[key]);
            }
        }
        return newConfig;
    } else {
        return config;
    }
}

dotenv.config();

const env: string = process.env.NODE_ENV || 'dev';

const configPath: string = join(__dirname, '..', 'config.json');

const fileContents: string = readFileSync(configPath, 'utf8');

const config: Record<string, any> = JSON.parse(fileContents) as Record<string, any>;
const envConfig: Record<string, any> = config['environments'][env];
if (!envConfig) {
    throw new Error(`Environment configuration for '${env}' not found.`);
}
const envConfigWithEnvVars: Record<string, any> = replaceEnvPlaceholders(envConfig);

const finalConfig: Record<string, any> = {
    env,
    ...config,
    ...envConfigWithEnvVars,
};

delete finalConfig.environments;

export default finalConfig;