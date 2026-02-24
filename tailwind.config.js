/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#D42B2B',
                dark: '#0A0A0A',
                light: '#FAFAFA',
            },
        },
    },
    plugins: [],
}
