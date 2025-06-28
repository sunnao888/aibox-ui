export default (async () => {
  // 使用动态 import() 来加载 ESM 模块
  const config = await import('@vben/commitlint-config');
  // 返回该模块的默认导出
  return config.default;
})();
