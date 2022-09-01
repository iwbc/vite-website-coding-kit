module.exports = async () => {
  return {
    testMatch: ['**/__tests__/**/*.?(c)[jt]s?(x)', '**/?(*.)+(spec|test).?(c)[jt]s?(x)'],
  };
};
