// Polyfills for React Native Web compatibility
import 'url-polyfill';

// Add global polyfills for Supabase compatibility
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Process polyfill
if (typeof process === 'undefined') {
  (global as any).process = require('process/browser');
}

// Ensure crypto is available
if (typeof crypto === 'undefined') {
  const crypto = require('crypto-browserify');
  (global as any).crypto = crypto;
}

// TextEncoder/TextDecoder polyfill
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  (global as any).TextEncoder = TextEncoder;
  (global as any).TextDecoder = TextDecoder;
}

// Buffer polyfill
if (typeof Buffer === 'undefined') {
  (global as any).Buffer = require('buffer').Buffer;
}

// Stream polyfill
if (typeof require !== 'undefined') {
  try {
    require('stream');
  } catch (e) {
    (global as any).stream = require('stream-browserify');
  }
}
