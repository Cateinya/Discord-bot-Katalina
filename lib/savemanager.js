const fs = require('fs');
const path = require('path');

class SaveManager {
    saveFile(file, data){
        file = path.normalize(__dirname + "/saves/" + file);
        var dataString = JSON.stringify(data);
        fs.writeFile(file, dataString, (err) => {
            if (err) throw err;
        });
    }

    loadFile(file, data) {
        file = path.normalize(__dirname + "/saves/" + file);
        if(fs.existsSync(file)){
            var dataString = fs.readFileSync(file, 'utf8');
            var dataJson = JSON.parse(dataString);

            Object.assign(data, dataJson);
        }
    }
}

var saveManager = new SaveManager();

module.exports = saveManager;