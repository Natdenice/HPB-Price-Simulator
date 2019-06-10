/* eslint-disable no-new */
/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable no-console */

let portfolioAmount;
let hpbFuturePrice;
let button;

let marketCap = document.getElementById('marketcapInput');
let circulatingSupply = document.getElementById('circulatingSupplyInput');
let tokenQuantity = document.getElementById('tokenquantityInput');
const result = document.querySelector('#resultParagraph');
const coinInfoParagraph = document.querySelector('#cryptoinfo');

const formatNumber = (num, rounder) => {
  // eslint-disable-next-line no-param-reassign
  num = Math.abs(num);
  // eslint-disable-next-line no-param-reassign
  num = num.toFixed(rounder);
  const numSplit = num.split('.');

  // eslint-disable-next-line prefer-destructuring
  let int = numSplit[0];
  if (int.length > 3) {
    for (let i = 3; i < int.length; i += 4) {
      int = `${int.substr(0, int.length - i)},${int.substr(int.length - i, i)}`;
    }
  }
  const dec = numSplit[1];
  return `${int}.${dec}`;
};

const formatNumbersInsideInputs = () => {
  circulatingSupplyInput.value = 38022632;
  new AutoNumeric('#tokenquantityInput');
  new AutoNumeric('#circulatingSupplyInput');
  new AutoNumeric('#marketcapInput');
};

formatNumbersInsideInputs();

// When page loads, Fill inputs once time with current mcap and circ supply
/*
async function getDataInInputs() {
  try {
    const dataResult = await fetch(
      'https://api.coingecko.com/api/v3/coins/high-performance-blockchain',
    );
    const data = await dataResult.json();

    let currentCirculatingSupply = data.market_data.circulating_supply;
    const marketCapInfo = data.market_data.market_cap.usd;
    marketCap.value = marketCapInfo;
    currentCirculatingSupply = currentCirculatingSupply.toFixed(0);
    circulatingSupply.value = currentCirculatingSupply;
  } catch (error) {
    return error;
  }
}
*/

// Get all essential data from coingecko api ( mcap, circSupply, price in usd, price
// in BTC, Valuechange in 24h, and ATH in btc and usd)
function refresh() {
  async function getPriceAndMcap() {
    try {
      const dataResult = await fetch(
        'https://api.coingecko.com/api/v3/coins/high-performance-blockchain',
      );
      const data = await dataResult.json();
      // get current price in BTC
      const satoshiPrice = data.tickers[4].converted_last.btc;
      // get current circulating supply
      let currentCirculatingSupply = data.market_data.circulating_supply;
      currentCirculatingSupply = currentCirculatingSupply.toFixed(0);

      // get current price
      const athInBtc = data.market_data.ath.btc;
      const athInUsd = data.market_data.ath.usd;
      const price = data.market_data.current_price.usd;
      const valueChangeIn24H = data.market_data.price_change_percentage_24h_in_currency.usd;
      const roundedValueChangeIn24H = valueChangeIn24H.toFixed(2);
      // get current mcap
      const marketCapInfo = data.market_data.market_cap.usd;
      // get current mcap rank
      const marketCapRank = data.market_cap_rank;

      // Display all data
      const coinInfo = `The current price of High Performance Blockchain is $${formatNumber(
        price,
        4,
      )} ( Ƀ${satoshiPrice.toFixed(8)} ) with a current market cap of $${formatNumber(
        marketCapInfo,
        2,
      )} and a current circulating supply of ${formatNumber(
        currentCirculatingSupply,
        2,
      )} tokens.<br>
      All Time High in USD : $${athInUsd} <br>
      All Time High in BTC : Ƀ${athInBtc} <br>
      Value change in 24 Hours : ${roundedValueChangeIn24H} % <br>
      HPB market cap rank #${marketCapRank}`;
      return coinInfo;
    } catch (error) {
      return error;
    }
  }
  // eslint-disable-next-line no-shadow
  getPriceAndMcap().then((result) => {
    // Cleaning our DOM before refreshing
    coinInfoParagraph.innerHTML = '';

    const newContent = `<p class='text-center mt-5' id='cryptoinfo'>${result}</p>`;
    coinInfoParagraph.insertAdjacentHTML('afterbegin', newContent);
  });
}

function simulateFuturePrice() {
  formatNumbersInsideInputs();
  new AutoNumeric('#tokenquantityInput');
  new AutoNumeric('#circulatingSupplyInput');
  new AutoNumeric('#marketcapInput');

  marketCap = parseFloat(marketCap.value.split(',').join(''));
  circulatingSupply = parseFloat(circulatingSupply.value.split(',').join(''));
  tokenQuantity = parseFloat(tokenQuantity.value.split(',').join(''));

  portfolioAmount = (marketCap / circulatingSupply) * tokenQuantity;

  hpbFuturePrice = marketCap / circulatingSupply;

  result.textContent = `
      Your hpb portfolio will worth $${formatNumber(
    portfolioAmount,
    2,
  )}. With the market cap and the circulating supply specified, HPB token will worth $${formatNumber(
  hpbFuturePrice,
  2,
)}
    `;
}

const setupEventListeners = () => {
  document.addEventListener('keypress', (event) => {
    if (event.keyCode === 13 || event.which === 13) {
      simulateFuturePrice();
      event.preventDefault();
    }
  });
  button = document.querySelector('button');
  button.addEventListener('click', simulateFuturePrice);
};

setupEventListeners();

window.setInterval(() => {
  refresh();
}, 650);
