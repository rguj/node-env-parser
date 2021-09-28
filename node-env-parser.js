

/*
    NODE-ENV-PARSER
    No more headaches! Your best utility for parsing .env variables in Node JS. Code was built based from Laravel's ENV parsing principle.

    Instruction:
    1) Put this file at the root of the project folder the same level as "main.js" and ".env" file
    2) Prepend this code at the most top of your main.js file:
        global.env = require('./env').parse()
    3) You can access your ENV variables anywhere in your project (server-side)
    4) Please suggest revisions of this code to enhance it
*/


const fs = require('fs')
const env_path = './.env'



// array value type evaluator
const evaluator = function(str) {
    str = String(str)
    // test for bool or null
    switch(str.toLowerCase()) {  
        case 'true':
        case '(true)':
            return true;
        case 'false':
        case '(false)':
            return false;
        case 'empty':
        case '(empty)':
            return '';
        case 'null':
        case '(null)':
            return null;
    }
    // for string
    if(new RegExp("^\".*\"$").test(str)) {
        return str.substring(1, str.length-1);
    }        
    // for numeric
    if(!isNaN(str)) {
        return Number(str)
    } 
    // for unknown       
    return undefined
}




exports.parse = function() {
    var final_tokens = {}
    var file = fs.readFileSync(env_path, {encoding:'utf8', flag:'r'})
    const lines = file.split(/[\n\r]+/u)

    // key/value separator
    var tokens = []    
    for (var line of lines) {
        line = line.trim()
        if(line.length === 0) continue
        var flag = [false, false, false, false]  // key, equal, open_quote, close_quote
        var chars = line.split(/(?!$)/u)
        var pair = ['', '']
        for(var x=0; x<chars.length; x++) {
            var ch = chars[x]
            var equal_now = false
            if(x === 0 && !flag[0])
                flag[0] = true
            if(flag[0] && !flag[1] && ch === '=') {
                flag[1] = true
                equal_now = true
            }
            if(flag[0] && flag[1] && !flag[2] && ch === '"')
                flag[2] = true
            if(flag[0] && flag[1] && flag[2] && !flag[3] && ch === '"')
                flag[3] = true
            // check point
            var bool1 = (
                ch === '#'
                && ((!flag[2] && !flag[3]) || (flag[2] && flag[3]))
            ); if(bool1) break;
            if(!flag[1]) {  // key token
                pair[0] = pair[0] + ch
            }
            else {  // value token
                if(!equal_now) {
                    pair[1] = pair[1] + ch
                }
            }
        }        
        if(pair[0].length > 0) {
            pair = [pair[0].trim(), pair[1].trim()]
            pair[1] = pair[1] === '' ? 'undefined' : pair[1]
            tokens.push(pair)
        }
    }
    // console.log(tokens)

    // evaluate data type
    var tokens2 = {}
    for(var x=0; x<tokens.length; x++) {
        tokens2[tokens[x][0]] = evaluator(tokens[x][1])
    }        
    // console.log(tokens2)

    // parsing variables / finding backward only
    var tokens3 = {}
    for(const [key, value] of Object.entries(tokens2)) {
        if(typeof value !== 'string') {
            tokens3[key] = value
        } else {
            var regex1 = new RegExp("(?=\\${.*?})|(?<=\\${.*?})")
            var test = regex1.test(value)
            if(test) {
                var pcs1 = value.split(regex1)  
                if(pcs1.length === 1) {
                    tokens3[key] = tokens3[value.substring(2, value.length-1)]
                } else {
                    var str2 = ""
                    for(var y=0; y<pcs1.length; y++) {
                        if(new RegExp("\\${.*?}").test(pcs1[y])) {
                            str2 = str2 + tokens3[pcs1[y].substring(2, pcs1[y].length-1)]
                        } else {
                            str2 = str2 + pcs1[y]
                        }
                    }
                    tokens3[key] = str2
                }
            } else {
                tokens3[key] = value
            }
        }
    }
    // console.log(tokens3)


    final_tokens = tokens3
    return final_tokens
}

