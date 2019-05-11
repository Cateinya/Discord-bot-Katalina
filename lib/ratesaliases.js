const DataObject = require('./dataobject')
const file = 'ratesaliases.save';

class RatesAliases extends DataObject{
    constructor(file){
        super(file);
    }
}

var ratesAliases = new RatesAliases(file);

module.exports = ratesAliases;