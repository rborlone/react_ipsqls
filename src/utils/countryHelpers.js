// Mapa de códigos de país ISO 3166-1 alpha-2
export const getCountryCode = (countryName) => {
  const countryMap = {
    'United States': 'US',
    'Canada': 'CA',
    'Mexico': 'MX',
    'Brazil': 'BR',
    'Argentina': 'AR',
    'Spain': 'ES',
    'France': 'FR',
    'Germany': 'DE',
    'Italy': 'IT',
    'United Kingdom': 'GB',
    'China': 'CN',
    'Japan': 'JP',
    'South Korea': 'KR',
    'India': 'IN',
    'Australia': 'AU',
    // Agregar más países según necesidad
  };

  return countryMap[countryName] || null;
};
