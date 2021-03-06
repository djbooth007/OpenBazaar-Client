var __ = require('underscore'),
    Backbone = require('backbone'),
    Polyglot = require('node-polyglot'),
    languagesModel = require('../models/languagesMd'),
    countriesMd = require('./countriesMd');

module.exports = Backbone.Model.extend({

  initialize: function(){
    this.countries = new countriesMd();
    this.countryArray = this.countries.get('countries');
    this.languages = new languagesModel();
  },

  defaults: {

    guid: "", //set by app.js
    //name: "Your Name",
    //handle: "Blockchain ID",
    //currency: "US Dollar", //set by user action, not by server

    refund_address: "", //buyer’s refund address (string)
    currency_code: "BTC", //may either be “btc” or a currency from this list. (formatted string)
    country: "UNITED_STATES", //the location of the user. must be a formatted string from this list. (formatted string)

    language: "en", //user�s prefered language (string)
    time_zone: "", //the user�s time zone (string)
    notifications: true, //display notifications (�True� or �False�)
    shipping_addresses: [], //array of addresses
    blocked: [], //a list of guids to block (LIST of 40 character hex strings)
    libbitcoin_server: "", //the server address (url string)
    ssl: true, //use ssl on the openbazaar server (�True� or �False�)
    serverUrl: "http://localhost:18469/api/v1/", //set from localStorage

    //value below for testing. Real value should be dynamically set
    //serverUrl: "http://seed.openbazaar.org:18469/api/v1/",
    terms_conditions: "No terms or conditions", //default terms/conditions (string)
    refund_policy: "No refund policy", //default refund policy (string)

    //bitcoinValidationRegex: "^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$"
    //remove this when in production, this is for testNet addresses
    bitcoinValidationRegex: "^[a-km-zA-HJ-NP-Z1-9]{25,34}$"

  },

  parse: function(response) {
    "use strict";

    //make sure currency code is in all caps
    response.currency_code = response.currency_code ? response.currency_code.toUpperCase() : "BTC";

    //find the human readable name for the country
    var matchedCountry = this.countryArray.filter(function(value){
      return value.dataName == response.country;
    });
    response.displayCountry = matchedCountry[0] ? matchedCountry[0].name : "";

    //addresses come from the server as a string. Parse the string
    if(response.shipping_addresses && response.shipping_addresses.constructor === Array && response.shipping_addresses.length > 0){
      try{
        var tempAddresses = [];
        __.each(response.shipping_addresses, function (address) {
          if (address){
            address = JSON.parse(address);
            if (address.name && address.street && address.city && address.state && address.postal_code && address.country && address.displayCountry){
              tempAddresses.push(address);
            }
          }
        });
        response.shipping_addresses = tempAddresses;
      } catch(e) {
        //server may set a malformed shipping_address value
        console.log("Error in shipping_addresses:");
        console.log(e);
        response.shipping_addresses = [];
      }

    } else {
      response.shipping_addresses = [];
    }

    //set the client language to match the language in the response
    response.language = response.language || "en";
    window.polyglot = new Polyglot({locale: response.language});
    window.polyglot.extend(__.where(this.languages.get('languages'), {langCode: response.language})[0]);

    return response;
  }
});
