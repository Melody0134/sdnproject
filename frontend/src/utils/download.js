const getFilename = (contentDisposition, fallback) => {
  const match = contentDisposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  if (!match) return fallback;
  return decodeURIComponent(match[1] || match[2]);
};

export const downloadProtectedFile = async (request, fallbackFilename = 'download') => {
  const response = await request();
  const filename = getFilename(response.headers?.['content-disposition'], fallbackFilename);
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
