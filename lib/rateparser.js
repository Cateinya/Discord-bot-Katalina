class RateParser {
    parse (rawRates){
        try {
            if (rawRates['ratio'].length == 3) {
                var tempRates = {};
            
                var category_count = rawRates['appear'].length;

                for (var i = 0; i < category_count; i++){
                    var category_name = rawRates['appear'][i]['category_name'];
                    var rarity = 4 - rawRates['appear'][i]['rarity']; //Cygames...
                    var rarity_name = rawRates['ratio'][rarity]['rare'];
                    
                    if (!tempRates[rarity_name]){
                        tempRates[rarity_name] = {
                            'drop_rate' : parseFloat(rawRates['ratio'][rarity]['ratio']) / 100.0
                        };
                    }
                    
                    tempRates[rarity_name][category_name] = parseItemList(rawRates['appear'][i]);
                }

                return tempRates;
            } else {
                return;
            }

        } catch (err) {
            console.log(err);
            return;
        }
    }
}

function parseItemList(rate_list){
    var item_count = rate_list['item'].length;
    var item_list = {};

    for (var j = 0; j < item_count; j++){
        var item = rate_list['item'][j];
        if (!item_list[item['drop_rate']]){
            item_list[item['drop_rate']] = {
                'list' : []
            }
        }

        var cleaned_item = {
            'name' : item['name'],
            'attribute' : item['attribute']
        };

        if (item['kind']) cleaned_item['kind'] = item['kind'];
        if (item['incidence']) cleaned_item['incidence'] = item['incidence'];
        if (item['character_name']) cleaned_item['character_name'] = item['character_name'];

        item_list[item['drop_rate']]['list'].push(cleaned_item);
    }

    for (var drop_rate in item_list){
        item_list[drop_rate]['count'] = item_list[drop_rate]['list'].length;
        item_list[drop_rate]['total_rate'] = item_list[drop_rate]['list'].length * parseFloat(drop_rate) * 1000;
    }

    return item_list;
}

var rateParser = new RateParser();

module.exports = rateParser;