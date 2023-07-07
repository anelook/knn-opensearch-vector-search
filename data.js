const fs = require('fs');
const filePath = 'full_format_recipes.json';

/**
 * run-func data cleanData
 */
module.exports.cleanData = () => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        try {
            const jsonArray = JSON.parse(data);
            const filteredArray = jsonArray.filter(item => {
                const directions = item.directions;
                return directions !== null && Array.isArray(directions) && directions.length > 0;
            });
            console.log(filteredArray.length);

            const filteredDataJson = JSON.stringify(filteredArray);
            const outputPath = 'recipes_clean.json';
            fs.writeFile(outputPath, filteredDataJson, 'utf8', err => {
                if (err) {
                    console.error('Error writing to file:', err);
                    return;
                }

                console.log('Filtered data saved to recipes_clean.json');
            });
        } catch (err) {
            console.error('Error parsing JSON:', err);
        }
    });
};
