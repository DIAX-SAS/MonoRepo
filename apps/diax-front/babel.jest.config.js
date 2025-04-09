module.exports = {
    presets: [
      ['@babel/preset-env'],
      [
        '@babel/preset-react',
        {
          runtime: 'automatic', // ✅ usa el nuevo JSX transform
        },
      ],
      '@babel/preset-typescript',
    ],
  };
  