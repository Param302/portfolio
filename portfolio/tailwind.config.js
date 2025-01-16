/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                lightBlue: '#f0f8ff', // Very light blue
                primaryBlue: '#007bff', // Main theme blue
                darkBlue: '#0056b3', // Darker blue for contrast
            },
            fontFamily: {
                serif: ['Merriweather', 'serif'], // Heading font
                mono: ['Fira Code', 'monospace'], // Descriptive/secondary font
            },
        },
    },
    plugins: [],
};
