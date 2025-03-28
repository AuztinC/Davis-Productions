import { defineFunction, secret } from '@aws-amplify/backend';

export const FlexApiFunction = defineFunction({ 
    environment: {
        API_ENDPOINT: 'https://ssav.flexrentalsolutions.com/f5/api',
        API_KEY: secret('X-Auth-Token')
    }
 });