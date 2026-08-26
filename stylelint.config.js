/**
 * Rules that are switched off are switched off for a reason, written down
 * next to each one. Everything else is stylelint-config-standard.
 */
export default {
  extends: 'stylelint-config-standard',
  rules: {
    // BEM: block__element--modifier, plus the .is-* state classes the
    // motion modules add at runtime.
    'selector-class-pattern': [
      '^(is-[a-z0-9-]+|js|no-js|[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?)$',
      {
        message: 'Expected class selector to be BEM: block__element--modifier',
      },
    ],

    // Design tokens are named --step--1, --color-ink-muted and so on; the
    // default pattern rejects the double dash in --step--1.
    'custom-property-pattern': null,

    // `(min-width: 48rem)` is supported everywhere. The range notation
    // `(width >= 48rem)` is not — no Safari before 16.4. This site is
    // deployed, so it keeps the syntax with the wider support.
    'media-feature-range-notation': 'prefix',

    // Vite resolves `@import './base.css'`. Leave the working form alone.
    'import-notation': 'string',

    // `currentColor` is the conventional spelling and reads better than
    // `currentcolor`; the font stacks are proper names, not keywords.
    'value-keyword-case': [
      'lower',
      {
        ignoreKeywords: ['currentColor'],
        ignoreProperties: ['--font-display', '--font-body', '--font-utility'],
      },
    ],

    // Quote every family name that is not a CSS keyword, so the font stacks
    // read consistently rather than half-quoted.
    'font-family-name-quotes': 'always-unless-keyword',

    // Blank lines inside a block are used to group related declarations
    // (see .spotlight-overlay, .corner-off__piece) and to separate the token
    // groups. That grouping is worth more than the consistency these buy.
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,

    // Both reports are rules that cannot collide in practice
    // (.doodle__action:disabled vs :hover:not(:disabled), and two `img`
    // selectors under different blocks). The rule cannot see that.
    'no-descending-specificity': null,

    // Longhands are sometimes written out for clarity over a shorthand.
    'declaration-block-no-redundant-longhand-properties': null,

    // Both of these "modernise" into worse browser support, and --fix
    // applies them silently:
    //   -webkit-text-size-adjust  → text-size-adjust, which Safari (the
    //     only engine that inflates text on rotation) does not implement.
    //   :not(:focus):not(:active) → :not(:focus, :active), a Selectors 4
    //     list. If it fails to parse, every visually-hidden label on the
    //     page becomes visible.
    'property-no-vendor-prefix': null,
    'selector-not-notation': 'simple',
  },
};
