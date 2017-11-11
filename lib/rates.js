const DataObject = require('./dataobject')
const file = './rates.save';

class Rates extends DataObject{
    constructor(file){
        super(file);
    }
};

var rates = new Rates(file);

module.exports = rates;