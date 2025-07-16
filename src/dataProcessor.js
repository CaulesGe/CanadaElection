export function cleanKeys(data) {
    return data.map(entry => {
      const cleaned = {};
      Object.entries(entry).forEach(([key, value]) => {
        const newKey = key.split('/')[0].trim();
        const newValue = key.split('/')[0].trim();
        cleaned[newKey] = newValue;
      });
      return cleaned;
    });
  }
  