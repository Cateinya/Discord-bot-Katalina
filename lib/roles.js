const DataObject = require('./dataobject')
const file = './roles.save';

class Roles extends DataObject{
    constructor(file){
        super(file);
    }
};

var roles = new Roles(file);

module.exports = roles;