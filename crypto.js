/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable no-console */
let portfolioAmount;
let hpbFuturePrice;
let button;

const marketCapInput = new AutoNumeric('#marketcapInput', {
  noEventListeners: false,
  readOnly: false,
});

const circSupplyInput = new AutoNumeric('#circulatingSupplyInput', {
  noEventListeners: false,
  readOnly: false,
});

const tokenQuantityInput = new AutoNumeric('#tokenquantityInput', {
  noEventListeners: false,
  readOnly: false,
});

const result = document.querySelector('#resultParagraph');
const coinInfoParagraph = document.querySelector('#cryptoinfo');
/* eslint-disable no-const-assign */

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

function refresh() {
  async function getPriceAndMcap() {
    try {
      const dataResult = await fetch(
        'https://api.coingecko.com/api/v3/coins/high-performance-blockchain',
      );
      const data = await dataResult.json();

      // get current price in USD
      const currentPrice = data.market_data.current_price.usd;
      // Hardcode current CircSupply due to false circSupply data from API
      const currentCirculatingSupply = 57903793;
      // calculate the real mcap with the real circulating supply ( not from API )
      const currentMarketCap = currentPrice * currentCirculatingSupply;
      // get current price in BTC
      const satoshiPrice = data.tickers[4].converted_last.btc;
      // get Ath In BTC
      const athInBtc = data.market_data.ath.btc;
      // get Ath in USD
      const athInUsd = data.market_data.ath.usd;
      // get 24H traded volume
      const volumeIn24H = data.market_data.total_volume.usd;
      // get valuechange in 24h ( USD )
      let usdValueChangeIn24H = data.market_data.price_change_percentage_24h_in_currency.usd;
      // round the percentage of usdValueChangeIn24H
      usdValueChangeIn24H = usdValueChangeIn24H.toFixed(2);
      // get valuechange in 24h ( BTC )
      let btcValueChangeIn24H = data.market_data.price_change_percentage_24h_in_currency.btc;
      // round the percentage of btcValueChangeIn24H
      btcValueChangeIn24H = btcValueChangeIn24H.toFixed(2);
      // get valuechange in 24H ( ETH )
      let ethValueChangeIn24H = data.market_data.price_change_percentage_24h_in_currency.eth;
      // round the percentage of ethValueChangeIn24H
      ethValueChangeIn24H = ethValueChangeIn24H.toFixed(2);
      // get current mcap rank
      const marketCapRank = data.market_cap_rank;

      // Display all data
      const coinInfo = `The current price of High Performance Blockchain is $${formatNumber(
        currentPrice,
        4,
      )} ( Ƀ${satoshiPrice.toFixed(8)} ) with a current market cap of $${formatNumber(
        currentMarketCap,
        2,
      )} and a current circulating supply of ${formatNumber(
        currentCirculatingSupply,
        2,
      )} tokens.<br>
      USD Value change in 24H : ${usdValueChangeIn24H} % <br>
      BTC Value change in 24H : ${btcValueChangeIn24H} % <br>
      ETH Value change in 24H : ${ethValueChangeIn24H} % <br>
      ATH in USD : $${athInUsd} <br>
      ATH in BTC : Ƀ${formatNumber(athInBtc, 8)} <br>
      Volume in 24 Hours : $${formatNumber(volumeIn24H, 2)} <br>
      HPB market cap rank #${marketCapRank}
      `;

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

// Function created to calculate the future value of HPB Price and Porfolio worth

function simulateFuturePrice() {
  const mc = marketCapInput.getNumber();
  const cs = circSupplyInput.getNumber();
  const tq = tokenQuantityInput.getNumber();
  portfolioAmount = (mc / cs) * tq;
  hpbFuturePrice = mc / cs;

  result.textContent = `
      Your HPB portfolio will worth $${formatNumber(
    portfolioAmount,
    2,
  )}. With the market cap and the circulating supply specified, HPB coin will worth $${formatNumber(
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

// Create a function to set the circ supply input directly at 42046512
// ( real circ supply ) and set directly the current mcap (by calling API) in corresponding inputs
// and let to the user the possibily to modify theses values
async function circSupplyAndMcapInInputs() {
  try {
    const dataResult = await fetch(
      'https://api.coingecko.com/api/v3/coins/high-performance-blockchain',
    );
    const data = await dataResult.json();
    // Hardcode current CircSupply due to false circSupply data from API
    const currentCirculatingSupply = 57903793;
    circSupplyInput.set(57903793, { readOnly: false });

    // Get the current price of HPB by calling API , we need this information to calculate
    // the real marketcap ( cause CoinGecko API doesnt have the right circ supply of HPB)
    const currentPrice = data.market_data.current_price.usd;

    // calculate the real mcap with the real circulating supply ( not from API )
    const currentMarketCap = currentPrice * currentCirculatingSupply;
    // Set directly the marketCap into marketCap Input ( and let the user modify this value too)
    marketCapInput.set(currentMarketCap, { readOnly: false });
  } catch (error) {
    return error;
  }
}

circSupplyAndMcapInInputs();

// Refresh getPriceAndMcap function with the API Call each 650 ms
// in order to get fresh live informations in our App
window.setInterval(() => {
  refresh();
}, 650);
