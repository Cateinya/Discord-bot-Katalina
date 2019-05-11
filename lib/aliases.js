const DataObject = require('./dataobject')
const file = 'aliases.save';

class Aliases extends DataObject{
    constructor(file){
        super(file);
    }
}

var aliases = new Aliases(file);

module.exports = aliases;