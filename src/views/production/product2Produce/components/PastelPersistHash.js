/* eslint-disable no-else-return */
/* eslint-disable prefer-template */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
let colorTable = {}; // Global variable to store the hash table

function stringToPastelColor(str) {
  let hash = 0;
  for (let i = 0; i < str?.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pastelBase = [100, 90, 80];
  let color = '#';
  for (let j = 0; j < 3; j++) {
    let value = (hash >> (j * 8)) & 0xff;
    value = Math.floor((value + pastelBase[j]) / 2);
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

function GeneratePastelColors(input) {
  colorTable = {};
  const str = input;
  if (!colorTable[str]) {
    const color = stringToPastelColor(str);
    colorTable[str] = color;
  }
  return colorTable[str];
}

export default GeneratePastelColors;
