/*jshint node:true*/
//author: github.com/jnaklaas

var Converter = require("csvtojson").Converter,
    jsonexport = require('jsonexport'),
    fs = require('fs'),
    ProgressBar = require('progress');
    //jsdom = require("jsdom");

var inputFile = process.argv[2],
    outputFile = (process.argv[3]) ? process.argv[3] : 'output.csv';

var converter = new Converter({delimiter: ";"});

converter.fromFile(inputFile, function (err, shopifyProducts) {
    if (err) return console.log("converter error: " + err);

    var lightspeedProducts = [],
        lastShopifyProduct,
        shopifyProductVariant,
        ID_incrementor = 0,
        numImgs = 0,
        numProductOptions = 0,
        bar = new ProgressBar('parsing :percent :bar', { total: shopifyProducts.length });

    shopifyProducts.forEach(function (shopifyProduct, index) {
        bar.tick();
        
        //if Product Options hidden product
        if(shopifyProduct.Type === 'OPTIONS_HIDDEN_PRODUCT'){ 
            numProductOptions++;
            return;
        }
        
        //if product image
        if(shopifyProduct.Title === '' && shopifyProduct["Option1 Value"] === ''){
            lightspeedProducts[lightspeedProducts.length-1].Images += ", " + shopifyProduct["Image Src"];
            numImgs++;
            return;
        }
        
        //if product || product variant
        var lightspeedProduct = {};
        
        //if product variant
        if(shopifyProduct.Title === ''){
            shopifyProductVariant = shopifyProduct;
            shopifyProduct = lastShopifyProduct;
        }
        
        //if product, increment ID
        else{
            shopifyProductVariant = shopifyProduct;
            lastShopifyProduct = shopifyProduct;
            ID_incrementor++;
        }
        
        
        
            
        lightspeedProduct.Internal_ID = ID_incrementor;
        lightspeedProduct.Internal_Variant_ID = "";
        lightspeedProduct.Visible = (shopifyProduct.Published)? "Y" : "N";
        lightspeedProduct.Brand = "";
        lightspeedProduct.Supplier = shopifyProduct.Vendor;
        lightspeedProduct.EN_Title_Short = shopifyProduct.Title;
        lightspeedProduct.EN_Title_Long = shopifyProduct.Title;
        var result = shopifyProduct["Body (HTML)"].match(/<p(.*?)<\/p>/m);
        lightspeedProduct.EN_Description_Short = (result)? result[0].replace(/<\/?[^>]+(>|$)/g, "") : "";
        lightspeedProduct.EN_Description_Long = shopifyProduct["Body (HTML)"];
        lightspeedProduct.EN_Variant = "";
        if(shopifyProduct["Option1 Name"] !== "Title" && shopifyProduct["Option1 Name"] !== "")
            lightspeedProduct.EN_Variant += shopifyProduct["Option1 Name"] + ": " + shopifyProductVariant['Option1 Value'];
        if(shopifyProduct["Option2 Name"] !== "")
            lightspeedProduct.EN_Variant += ", " + shopifyProduct["Option2 Name"] + ": " + shopifyProductVariant['Option2 Value'];
        if(shopifyProduct["Option3 Name"] !== "")
            lightspeedProduct.EN_Variant += ", " + shopifyProduct["Option3 Name"] + ": " + shopifyProductVariant['Option3 Value'];
        lightspeedProduct.Price = shopifyProductVariant["Variant Price"];
        lightspeedProduct.Price_Old = "";
        lightspeedProduct.Price_Cost = "";
        lightspeedProduct.Price_Unit = "";
        lightspeedProduct.Unit = "";
        lightspeedProduct.Tax = 0.2100;
        lightspeedProduct.Stock_Track = "Y";
        lightspeedProduct.Stock_Disable_Sold_Out = "N";
        lightspeedProduct.Stock_Level = 10;
        lightspeedProduct.Stock_Min = 0;
        lightspeedProduct.Stock_Alert = 5;
        lightspeedProduct.Article_Code = "";
        lightspeedProduct.EAN = "";
        lightspeedProduct.SKU = shopifyProductVariant["Variant SKU"];
        lightspeedProduct.Weight = shopifyProductVariant["Variant Grams"] +  shopifyProductVariant["Variant Weight Unit"] ;
        lightspeedProduct.Volume = "";
        lightspeedProduct.Colli = "";
        lightspeedProduct.Size_X = "";
        lightspeedProduct.Size_Y = "";
        lightspeedProduct.Size_Z = "";
        lightspeedProduct.Matrix = "";
        lightspeedProduct.Data_01 = "";
        lightspeedProduct.Data_02 = "";
        lightspeedProduct.Data_03 = "";
        lightspeedProduct.Buy_Min = "";
        lightspeedProduct.Buy_Max = "";
        lightspeedProduct.NL_Google_Category = "";
        lightspeedProduct.NL_Category_1 = "";
        lightspeedProduct.NL_Category_2 = "";
        lightspeedProduct.NL_Category_3 = "";
        lightspeedProduct.NL_Meta_Title = shopifyProduct.Title;
        lightspeedProduct.NL_Meta_Description = shopifyProduct["Body (HTML)"].replace(/<\/?[^>]+(>|$)/g, "").substr(0,160);
        lightspeedProduct.NL_Meta_Keywords = "";
        lightspeedProduct.Images = (shopifyProductVariant["Image Src"]) ? shopifyProductVariant["Image Src"] : shopifyProduct["Image Src"];
        if(shopifyProductVariant["Variant Image"] && shopifyProductVariant["Variant Image"] !== shopifyProductVariant["Image Src"]){
            lightspeedProduct.Images += ", " + shopifyProductVariant["Variant Image"];
        }
        lightspeedProduct.Tags = shopifyProduct.Tags.replace(/;/g, ",");
        
        lightspeedProducts.push(lightspeedProduct);
    });
    
    //console.log(lightspeedProducts[0]);
    console.log("parsed " + shopifyProducts.length + " lines: ");
    console.log("...    " + ID_incrementor + " products");
    console.log("...    " + (lightspeedProducts.length - ID_incrementor) + " product variants");
    console.log("...    " + numImgs + " images");
    console.log("...    " + numProductOptions + ' "Product Options" plugin lines');


    jsonexport(lightspeedProducts, {rowDelimiter: ";",orderHeaders: false, 'handleString': handleString}, function (err, csv) {
        if (err) return console.log("jsonexport error: " + err);

        fs.writeFile(outputFile, csv, function (err) {
            if (err) return console.log("fs error: " + err);
            console.log("\u270B  High five! Lightspeed product CSV generated!");
        });
    });

});

var handleString = function(string, name){
    if(string.length < 2 ) return string;
    //if contains quotes or delimiter, surround with quotes and double quotes
    if(string.indexOf('"' > -1) || string.indexOf(';'  > -1)){
        string = '"' + string.replace(/"/g, '""') + '"';
    }
    return string;
};