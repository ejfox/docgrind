/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.gray.700'),
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.gray.900'),
            },
            'p': {
              marginTop: theme('spacing.6'),
              marginBottom: theme('spacing.6'),
            },
            'li': {
              marginTop: theme('spacing.3'),
              marginBottom: theme('spacing.3'),
            },
            'li p': {
              marginTop: theme('spacing.3'),
              marginBottom: theme('spacing.3'),
            },
            'pre': {
              backgroundColor: theme('colors.gray.900'),
              color: theme('colors.gray.100'),
            },
            'code': {
              backgroundColor: theme('colors.gray.100'),
              color: theme('colors.gray.900'),
              fontWeight: '400',
              borderRadius: theme('borderRadius.sm'),
              paddingLeft: theme('spacing.1'),
              paddingRight: theme('spacing.1'),
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: 0,
            },
            'blockquote': {
              color: theme('colors.gray.600'),
              borderLeftColor: theme('colors.gray.300'),
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.gray.100'),
            },
            'strong': {
              color: theme('colors.gray.200'),
            },
            'code': {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.200'),
            },
            'pre': {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.200'),
            },
            'blockquote': {
              color: theme('colors.gray.400'),
              borderLeftColor: theme('colors.gray.600'),
            },
            'a': {
              color: theme('colors.blue.400'),
            },
            'a:hover': {
              color: theme('colors.blue.300'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}