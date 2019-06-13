import { Component, OnInit } from '@angular/core';
import { StocksService } from '../services/stocks.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

  today;

  topCompanies = 'AAPL,MSFT,AMZN,TSLA,GOOG';

  time;

  dateModel;

  data = [];

  topData = [];

  favourites;

  favouriteList = [];

  apiErrorSearch = false;

  apiErrorTop = false;

  loadingData = false;

  inputSettings = {
    value: null,
    placeholder: 'Company Symbol'
  }

  dropdownSettings = {
    list: [],
    commonList: [{
      key: 'EUR',
      value: 'EUR'
    }, {
      key: 'USD',
      value: 'USD'
    }, {
      key: 'GBP',
      value: 'GBP'
    }, {
      key: 'CHF',
      value: 'CHF'
    }, {
      key: 'CAD',
      value: 'CAD'
    }],
    selectedItem: {
      key: undefined,
      value: undefined
    },
    placeholder: 'Currency'
  }

  errorMessages = {
    invalidDate: false,
    invalidFields: false
  }

  constructor(private stockService: StocksService) {
    this.today = new Date();
  }

  ngOnInit() {
    this.loadingData = true;
    this.dropdownSettings.selectedItem.value = this.dropdownSettings.placeholder;
    this.favouriteList = localStorage.getItem('fav') ? localStorage.getItem('fav').split(',') : [];
    this.getCurrecny();
    this.getTop();
  }

  getCurrecny() {
    this.stockService.getCurrency().then(result => {
      this.dropdownSettings.list = result.map(m => {
        return {
          key: m.code,
          value: m.code
        }
      });
    })
  }

  getTop() {

    let params = {
      symbol: this.topCompanies
    };

    this.stockService.getStock(params).then(result => {
      this.topData = result;
      this.loadingData = false;
    }).catch(err => {
      this.loadingData = false;
      this.apiErrorTop = true;
    })
  }


  checkValues(event) {
    clearTimeout(this.time);

    this.time = setTimeout(() => {
      this.inputSettings.value = event.target.value;
    }, 100);
  }


  submit() {

    this.errorMessages = {
      invalidDate: false,
      invalidFields: false
    }

    this.apiErrorSearch = false;

    if (!this.dateModel || !this.dropdownSettings.selectedItem.key) {
      this.errorMessages.invalidFields = true;
      setTimeout(() => {
        this.errorMessages.invalidFields = false;
      }, 10000)
    } else {
      let date = this.dateModel.year + '-' + (this.dateModel.month < 10 ? '0' + this.dateModel.month : this.dateModel.month) + '-' + (this.dateModel.day < 10 ? '0' + this.dateModel.day : this.dateModel.day);

      if (new Date(date) >= new Date()) {
        this.errorMessages.invalidDate = true;
        setTimeout(() => {
          this.errorMessages.invalidDate = false;
        }, 10000)
      }

      let params = {
        symbol: this.inputSettings.value,
        currency: this.dropdownSettings.selectedItem.key,
        date: date
      }

      this.loadingData = true;

      this.stockService.searchStock(params).then(result => {
        this.favourites = localStorage.getItem('fav') ? localStorage.getItem('fav').split(',') : [];
        this.data = result.map(m => {

          if (this.favourites.indexOf(m.symbol) < 0) {
            m.fav = false;
          } else {
            m.fav = true;
          }
          return m;
        });

        this.loadingData = false;
      }).catch(err => {
        this.apiErrorSearch = true;
        this.loadingData = false;
      })

    }


  }

  setSelectedValue(item) {
    this.dropdownSettings.selectedItem = item;
  }

  saveFavourite(item) {

    this.favourites = localStorage.getItem('fav') ? localStorage.getItem('fav').split(',') : [];

    if (this.favourites.indexOf(item.symbol) < 0) {

      this.favourites.push(item.symbol);
      this.data = this.data.map(m => {
        if (m.symbol === item.symbol) {
          m.fav = true;
        }
        return m;
      })
    } else {
      this.favourites = this.favourites.filter(f => f !== item.symbol);
      this.data = this.data.map(m => {
        if (m.symbol === item.symbol) {
          m.fav = false;
        }
        return m;
      })
    }
    this.favouriteList = this.favourites;
    localStorage.setItem('fav', this.favourites.join(','));
  }

}
