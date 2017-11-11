const SaveManager = require('./savemanager');

module.exports = class DataObject{
    constructor(file){
        this.file = file;
        this.data = {};
        SaveManager.loadFile(this.file, this.data);
    }

    get(key){
        return this.data[key];
    }

    set(key, value){
        this.data[key] = value;
        SaveManager.saveFile(this.file, this.data);
    }

    setAll(dict){
        for(var key in dict){
            this.data[key] = dict[key];
        }
        SaveManager.saveFile(this.file, this.data);
    }

    remove(key){
        delete this.data[key];
        SaveManager.saveFile(this.file, this.data);
    }

    removeAll(keys){
        for(var i = 0; i < keys.length; i++){
            delete this.data[keys[i]];
        }
        SaveManager.saveFile(this.file, this.data);
    }
}