/*jshint node:true*/
//author: github.com/jnaklaas

var Converter = require("csvtojson").Converter,
    jsonexport = require('jsonexport'),
    fs = require('fs'),
    ProgressBar = require('progress'),
    argv = require('minimist')(process.argv.slice(2));

var inputFile = argv._[0],
    outputFile = (argv._[1]) ? argv._[1] : 'output.csv';

var delimiter;
switch(argv.delimiter){
    case "comma":       delimiter = ","; break;
    case "semicolon":   delimiter = ";"; break;
    default:            delimiter = ";";
}

var converter = new Converter({"delimiter": delimiter});

converter.fromFile(inputFile, function (err, shopifyCustomers) {
    if (err) return console.log("converter error: " + err);

    var lightspeedCustomers = [],
        bar = new ProgressBar('parsing :percent :bar', { total: shopifyCustomers.length });

    shopifyCustomers.forEach(function (shopifyCustomer, index) {
        bar.tick();
        var lightspeedCustomer = {};

        //unused fields
        //Province Code,,Country Code,,,Accepts Marketing,Total Spent,Total Orders,Tags,Note,Tax Exempt

        lightspeedCustomer.Registered = "";
        lightspeedCustomer.Language = "";
        lightspeedCustomer.Firstname = shopifyCustomer["First Name"];
        lightspeedCustomer.LastnamePreposition = "";
        lightspeedCustomer.Lastname = shopifyCustomer["Last Name"];
        lightspeedCustomer["E-mail"] = shopifyCustomer.Email;
        lightspeedCustomer.Phone = shopifyCustomer.Phone;
        lightspeedCustomer.Mobile = "";
        lightspeedCustomer.Company = shopifyCustomer.Company + " - " + shopifyCustomer.Address2;
        lightspeedCustomer.Streetname = shopifyCustomer.Address1;
        lightspeedCustomer.Number = "";
        lightspeedCustomer.Extension = "";
        lightspeedCustomer.Zipcode = shopifyCustomer.Zip;
        lightspeedCustomer.City = shopifyCustomer.City;
        lightspeedCustomer.Region = shopifyCustomer.Province;
        lightspeedCustomer.Country = shopifyCustomer.Country;
        lightspeedCustomer.Groups = "";
        lightspeedCustomer.Birthdate = "";
        lightspeedCustomer.Gender = "";
        lightspeedCustomer.Confirmed = "";

        lightspeedCustomers.push(lightspeedCustomer);

    });

    jsonexport(lightspeedCustomers, {rowDelimiter: ";",orderHeaders: false, 'handleString': handleString}, function (err, csv) {
        if (err) return console.log("jsonexport error: " + err);

        fs.writeFile(outputFile, csv, function (err) {
            if (err) return console.log("fs error: " + err);
            console.log("\u270B  High five! Lightspeed customer CSV generated!");
        });
    });

});

var handleString = function(string, name){
    if(string.length < 2 ) return string;
    //if contains quotes or delimiter, surround with quotes and double quotes
    if(string.indexOf('"' > -1) || string.indexOf(delimiter  > -1)){
        string = '"' + string.replace(/"/g, '""') + '"';
    }
    return string;
};
