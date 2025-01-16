/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                lightBlue: '#cfe1f1',
                primaryBlue: '#0040b6',
                darkBlue: '#090cb6',
                accentBlue: '0082d8'
            },
            fontFamily: {
                serif: ['Merriweather', 'serif'], // Heading font
                mono: ['Fira Code', 'monospace'], // Descriptive/secondary font
            },
        },
    },
    plugins: [],
};
