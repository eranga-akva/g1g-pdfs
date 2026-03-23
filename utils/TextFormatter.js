const getSignXLocation = (currentX, text, isLargeText = false) => {
    text = text.replace('%', '');
    if(isLargeText) {
        if(text.length < 3) {
            return currentX + 12;
        } else if (text.length < 5) {
            return currentX + 20;
        } 
        return currentX + 25;
    } else {
        if(text.length < 3) {
            return currentX + 8;
        } else if (text.length < 5) {
            return currentX + 12;
        } 
        return currentX + 16;
    }
}

function toPascalCase(str) {
    // initial data did not return pascal - commenting since now we get pascal
//   return str.replace(/(\w)(\w*)/g, function(_, first, rest) {
//     return first.toUpperCase() + rest.toLowerCase();
//   });
    return str;
}

function convertStringsToPascal(obj) {
    if (typeof obj === 'string') {
        return toPascalCase(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(item => convertStringsToPascal(item));
    } else if (typeof obj === 'object' && obj !== null) {
        let newObj = {};
        for (let key in obj) {
        if (typeof obj[key] === 'string') {
            newObj[key] = toPascalCase(obj[key]);
        } else {
            newObj[key] = convertStringsToPascal(obj[key]);
        }
        }
        return newObj;
    } else {
        return obj;
    }
}

module.exports = { getSignXLocation, convertStringsToPascal, toPascalCase };