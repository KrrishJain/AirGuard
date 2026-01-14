// src/utils/format.js
export const fmt = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return "--";
  return Number(value).toFixed(decimals);
};
