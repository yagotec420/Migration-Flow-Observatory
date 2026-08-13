import type { Config } from 'tailwindcss';
export default { content: ['./index.html', './src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#060a12', panel: '#0b1220', line: '#1e293b', cyan: '#4dd9ff', exit: '#fb5269', return: '#35d89a' }, boxShadow: { glow: '0 0 30px rgba(77,217,255,.15)' } } }, plugins: [] } satisfies Config;
