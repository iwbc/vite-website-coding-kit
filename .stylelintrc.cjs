module.exports = {
  extends: ['stylelint-config-recommended-scss', 'stylelint-config-recess-order', 'stylelint-config-prettier'],
  customSyntax: 'postcss-scss',
  rules: {
    'no-descending-specificity': null,
  },
};
