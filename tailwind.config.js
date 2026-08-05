const path = require('path');
const TDS_UI_CONFIG = require("./node_modules/tds-ui/tailwindcss/v2/tailwind.config.js").TDS_UI_TAILWINDCSS_CONFIG;
const TDS_UI_COLOR = require("./node_modules/tds-ui/tailwindcss/v2/tailwind.config.js").TDS_UI_TAILWINDCSS_COLORS;

const APP_COLOR = {};
const COLOR = { ...TDS_UI_COLOR, ...TDS_UI_CONFIG.theme.extend.colors, ...APP_COLOR };

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ...(TDS_UI_CONFIG.content || []),
    path.join(__dirname, 'apps/**/*.{html,ts,scss}'),
    path.join(__dirname, 'libs/**/*.{html,ts,scss}'),
  ],
  darkMode: "class",
  theme: {
    extend: {
      zIndex: {
        ...TDS_UI_CONFIG.theme.extend.zIndex,
      },
      colors: {
        ...COLOR,
      },
      ringColor: {
        ...COLOR,
      },
      borderColor: {
        ...COLOR,
      },
      boxShadow: {
        ...TDS_UI_CONFIG.theme.extend.boxShadow,
      },
      minWidth: {
        ...TDS_UI_CONFIG.theme.extend.minWidth,
      },
      minHeight: {
        ...TDS_UI_CONFIG.theme.extend.minHeight,
      },
      opacity: {
        ...TDS_UI_CONFIG.theme.extend.opacity,
      },
      fontSize: {
        ...TDS_UI_CONFIG.theme.extend.fontSize,
      },
      placeholderColor: {
        ...COLOR,
      },
      ringWidth: {
        ...TDS_UI_CONFIG.theme.extend.ringWidth,
      },
      height: {
        ...TDS_UI_CONFIG.theme.extend.height,
      },
      borderRadius: {
        ...TDS_UI_CONFIG.theme.extend.borderRadius,
      },
      fontWeight: {
        ...TDS_UI_CONFIG.theme.extend.fontWeight,
      },
      borderWidth: {
        ...TDS_UI_CONFIG.theme.extend.borderWidth,
      },
      spacing: {
        ...TDS_UI_CONFIG.theme.extend.spacing,
      },
      backgroundImage: {
        ...TDS_UI_CONFIG.theme.extend.backgroundImage,
      },
      transitionProperty: {
        ...TDS_UI_CONFIG.theme.extend.transitionProperty,
      },
      transitionTimingFunction: {
        ...TDS_UI_CONFIG.theme.extend.transitionTimingFunction,
      },
      keyframes: {
        ...TDS_UI_CONFIG.theme.extend.keyframes,
      },
      animation: {
        ...TDS_UI_CONFIG.theme.extend.animation,
      },
      fontFamily: {
        ...TDS_UI_CONFIG.theme.extend.fontFamily,
      },
      lineHeight: {
        ...TDS_UI_CONFIG.theme.extend.lineHeight,
      },
      screens: {
        ...TDS_UI_CONFIG.theme.extend.screens,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    ...(TDS_UI_CONFIG.plugin || []),
  ],
};
