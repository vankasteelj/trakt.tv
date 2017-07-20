// generate formatted helpdocation

const fs = require('fs')
const methods = require('../methods.json')
const pkjson = require('../package.json')

let helpdoc = Array()

// generator timestamp
helpdoc.push(`# Trakt.tv available methods \n\n\
This help doc was last generated for ${pkjson.name}@${pkjson.version} on ${new Date().toDateString()}\n\
`)

// example
helpdoc.push("## How to read the table ?\n\n\
It's simple JS, here's how to use the table below: \n\
> method({required_argument: 'value'}) \n\n\
For example: \n\
```js \n\
trakt.shows.summary({id: 'game-of-thrones'}).then(console.log) \n\
``` \n\n\
With optional arguments and pagination: \n\
```js \n\
trakt.seasons.comments({ \n\
  id: 'game-of-thrones', \n\
  season: 1, \n\
  sort: 'likes', \n\
  page: 1, \n\
  limit: 5 \n\
}).then(console.log) \n\
```\n\n\
## Fields explaination \n\
- **Method**: provided that `trakt` is the spawned instance of the 'trakt.tv' client, it's the function to call in order to request the API \n\
- **OAUTH**: if you need a user to be authenticated and logged in to make the call \n\
- **Required arguments**: they need to be passed as arguments (embded in a object) to the Method function\n\
- **Optional arguments**: arguments not required by the API, can also be embded in the same object as above\n\
- **Pagination**: you can send `pagination:true` in the object arg to trigger the pagination, or `page:X,limit:Y` (where X,Y are integers) to navigate in further calls\n\
- **Extended**: the method can be extended with one (or all) of the keywords\n\
- **Type**: the HTTP method used under the hood \n\
- **URI**: the actual URL contacted at api.trakt.tv\n\n\
")

// table markdown
helpdoc.push('## Table')
helpdoc.push('| Method | OAUTH | Required arguments | Optional arguments | Pagination | Extended | Type | URI |')
helpdoc.push('|--------|:-----:|--------------------|--------------------|:----------:|----------|:----:|----:|')

// methods
for (let m in methods) {
    
    // STRING:method call
    let method = m
        .replace('/', 'trakt.')     // first slash
        .replace(/\//g, '.')        // other slashes
        + '()'                      // it's a function

    // STRING:type
    let type = methods[m].method
    
    // STRING:authentication needed
    let auth = methods[m].opts.auth === true ? 'required' : methods[m].opts.auth === 'optional' ? '*optional*' : '*none*'

    // STRING:paginated
    let pag = methods[m].opts.pagination === true ? 'paginated' : methods[m].opts.pagination === 'optional' ? '*optional*' : '*none*'

    // ARRAY:extended
    let extended = function () {
        let ext = methods[m].opts.extended || Array()
        for (let i = 0; i < ext.length; i++) {
            ext[i] = '"' + ext[i] + '"';
        }
        return ext;
    }()

    // ARRAY:optional arguments
    let optional = methods[m].optional || Array()

    // ARRAY:find all available arguments
    let allargs = function () {
        let tmp = Array()
        let match

        // inside the url
        match = methods[m].url.match(/\:\w+[\/?]/g)
        if (match) {
            for (let i = 0; i < match.length; i++) {
                let arg = match[i].replace(/\:|\/|\?|\~/g, '')
                tmp.push(arg)
            }
        }

        // at the end of the url
        match = (methods[m].url + '~').match(/\:\w+[\~]/g)
        if (match) {
            for (let i = 0; i < match.length; i++) {
                let arg = match[i].split(':').pop().replace('~', '')
                if (arg.indexOf('/') !== -1) return
                tmp.push(arg)
            }
        }

        // html fields, like ?limit=
        match = methods[m].url.match(/(\?|\&)\w+\=/g)
        if (match) {
            for (let i = 0; i < match.length; i++) {
                tmp.push(match[i].replace(/\?|\&|=/g, ''))
            }
        }

        // in body + all 'body' args are optional
        for (let arg in methods[m].body) {
            tmp.push(arg)
            optional.push(arg)
        }

        return tmp
    }()

    // ARRAY:required arguments is calc(allargs - optional)
    let required = allargs.filter((item) => optional.indexOf(item) === -1)

    // STRING: uri should be => api.trakt.tv/shows/id/seasons/season/stats
    let uri = function () {
        // add url & remove fields
        let tmp = methods[m].url.split('?')[0]

        // set variables in bold 
        var match = tmp.match(/:.+?(\/|$)/g);
        for (let i in match) {
         let word = match[i].replace(/:|\//g, '')
         
         // don't bold if optional, remove it
         if (optional.indexOf(word) !== -1) {
             tmp = tmp.replace(match[i], '')
         } else {
             tmp = tmp.replace(match[i], '**'+word+'**/')
         }
        }

        return 'api.trakt.tv' + tmp.replace(/\/$/, '')
    }()

    // format the arrays
    required = required.length ? required.join(', ') : '*none*'
    extended = extended.length ? extended.join(', ') : '*none*'
    optional = optional.length ? optional.join(', ') : '*none*'

    // push line
    helpdoc.push(`| ${method} | ${auth} | ${required} | ${optional} | ${pag} | ${extended} | ${type} | ${uri} |`)
}

fs.writeFileSync('./docs/available_methods.md', helpdoc.join('\n'));