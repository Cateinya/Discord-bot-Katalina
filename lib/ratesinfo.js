const DataObject = require('./dataobject')
const file = 'ratesinfo.save';

class RatesInfo extends DataObject{
    constructor(file){
        super(file);
    }
}

var ratesInfo = new RatesInfo(file);

module.exports = ratesInfo;