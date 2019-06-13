'use strict';

let rp = require('request-promise')

const urlWorldTradingData = 'https://api.worldtradingdata.com/api/v1/';
const urlFixer = 'http://data.fixer.io/api/';

const requests = {
    getCurrency: (token) => {
        return {
            method: 'GET',
            uri: urlFixer + 'symbols',
            qs: {
                'access_key': token
            },
            json: true
        }
    },
    getStockSearch: (token, qs) => {

        qs['api_token'] = token;

        return {
            method: 'GET',
            uri: urlWorldTradingData + 'stock_search',
            qs: qs,
            json: true
        }
    },
    getHistoryData: (token, qs) => {

        qs['api_token'] = token;

        return {
            method: 'GET',
            uri: urlWorldTradingData + 'history_multi_single_day',
            qs: qs,
            json: true
        }
    },
    getCurrencyConversion: (token, date, qs) => {

        qs['access_key'] = token;

        return {
            method: 'GET',
            uri: urlFixer + date,
            qs: qs,
            json: true
        }
    },
    getStock: (token, qs) => {

        qs['api_token'] = token;

        return {
            method: 'GET',
            uri: urlWorldTradingData + 'stock',
            qs: qs,
            json: true
        }
    }
}

exports.getCurrency = function (tokenWTD, tokenFixer) {

    const request = requests.getCurrency(tokenFixer);

    return rp(request).then(res => {
        if (res.success) {
            return Object.keys(res.symbols).map(m => {
                return {
                    code: m,
                    description: res.symbols[m]
                }
            })
        } else {
            throw { code: "ERROR", message: "Error retrieving symbols" };
        }
    })

}

exports.getStock = async function (tokenWTD, params) {

    const request = requests.getStock(tokenWTD, params);
    let res;

    try {
        // Obrigado pela dica Tomás! :P
        res = await rp(request);
    } catch (err) {
        return Promise.reject({ code: "ERROR", message: "Error on request " + requests.url });
    }


    if (res) {
        if (res.data) {
            return Promise.resolve(res.data.map(m => {
                return {
                    symbol: m.symbol,
                    name: m.name,
                    currency: m.currency,
                    price: m.price
                }
            }));
        } else {
            return Promise.resolve(undefined);
        }
    }

}

exports.getStockHistory = function (tokenWTD, tokenFixer, params) {

    const paramsSearch = {
        search_term: params.symbol,
        search_by: 'symbol'
    }

    const requestSearch = requests.getStockSearch(tokenWTD, paramsSearch);

    let currencyList = [];

    let promiseList = [];

    let returnList;


    return rp(requestSearch).then(res => {

        if (res.total_returned === 0) {
            return [];
        }

        returnList = res.data;

        currencyList = returnList.map(m => m.currency);
        currencyList.push(params.currency);
        currencyList = currencyList.join(',');

        promiseList = returnList.map(m => {
            let paramsStock = {
                date: params.date,
                symbol: m.symbol
            }
            return rp(requests.getHistoryData(tokenWTD, paramsStock));
        });

        return Promise.all(promiseList)
    }).then(res => {

        if (res.length === 0) {
            return [];
        }

        returnList = returnList.map(m => {
            m.historic = ((res.find(f => (f.data || {})[m.symbol]) || {}).data || {})[m.symbol];
            return m;
        })

        if (returnList.filter(f => f.historic == undefined).length == returnList.length) {
            throw { code: "ERROR", message: "Error retrieving stock data" };
        }

        const paramsConvert = {
            symbols: currencyList
        }

        const requestConvert = requests.getCurrencyConversion(tokenFixer, params.date, paramsConvert);

        return rp(requestConvert);
    }).then(res => {
        if (!res.success) {
            throw { code: "ERROR", message: "Error retrieving stock data" };
        }

        returnList = returnList.map(m => {
            // Convert from local currency to EUR
            if (res.rates[m.currency]) {
                m.openConvert = res.rates[m.currency] != 0 && m.historic ? m.historic.open / res.rates[m.currency] : 0;
                m.closeConvert = res.rates[m.currency] != 0 && m.historic ? m.historic.close / res.rates[m.currency] : 0;

                // Convert to the wanted currency
                if (params.currency !== res.base) {
                    m.openConvert = m.openConvert * res.rates[params.currency];
                    m.closeConvert = m.closeConvert * res.rates[params.currency];
                }

                m.currencyConvert = params.currency;
            }
            return m;
        })

        return returnList;
    })

}