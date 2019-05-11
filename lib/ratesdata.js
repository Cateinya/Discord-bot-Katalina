const DataObject = require('./dataobject')
const file = 'ratesdata.save';

class RatesData extends DataObject{
    constructor(file){
        super(file);
    }
}

var ratesData = new RatesData(file);

module.exports = ratesData;