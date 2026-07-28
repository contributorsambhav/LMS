export const API_BASE_URL = typeof window !== 'undefined' 
  ? '/backend-proxy' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://44.211.39.221:5000');

export const STREAM_SERVICE_URL = typeof window !== 'undefined'
  ? '/stream-proxy'
  : (process.env.NEXT_PUBLIC_STREAM_SERVICE_URL || 'http://44.211.39.221:4000');
