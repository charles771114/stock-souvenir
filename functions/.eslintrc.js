module.exports = {
  env: {
    es2020: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  extends: ['eslint:recommended'],
  rules: {
    'max-len': ['warn', { code: 120 }],   // 放寬行寬限制
    'no-undef': 'off'                     // 暫時關閉未定義變數警告（或使用 global 設定）
  },
  globals: {
    db: 'readonly'
  }
}
