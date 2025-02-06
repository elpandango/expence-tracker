export default {
  content: [
    './pages/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        'main': 'var(--main-color)',
        'accent': 'var(--accent-color)',
        'bg': 'var(--bg-color)',
        'modal-bg': 'var(--modal-bg-color)',
        'modal-body': 'var(--modal-body-color)',
        'card-bg': 'var(--card-bg-color)',
        'list-item-bg': 'var(--list-item-bg-color)',
      },
      screens: {
        'max-sm': {'max': '480px'},
      },
    }
  },
  darkMode: ['class', '[data-theme="dark"]'],
  plugins: [],
}

