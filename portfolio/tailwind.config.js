/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                lightBlue: '#f8f8fd',
                primaryBlue: '#0040b6',
                darkBlue: '#090cb6',
                accentBlue: '0082d8'
            },
            fontFamily: {
                heading: ['Roboto'], // Heading font
                desc: ['Tomorrow', 'Fira Code'], // Descriptive/secondary font
            },
        },
    },
    plugins: [],
};
