const useConvertCurrency = (value = 0) => {
  const configDecimal = localStorage.getItem('ConfigDecimal');
  const currency = new Intl.NumberFormat('en-US', { minimumFractionDigits: configDecimal, maximumFractionDigits: configDecimal }).format(Number(value));
  return currency;
};

const useConvert = () => {
  return { useConvertCurrency };
};

export default useConvert;
