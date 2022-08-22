const fs = require('fs').promises

function escapeValue (value) {
    return `"${value.replace(/"/g, '""')}"`
}

module.exports.parse = function (file) {
    return file
        .trim()
        .match(/("([^"]|"")*?"|[^,\n]*)(,|\n|$)/g)
        .reduce((rows, value) => {
            if (value.length === 0) return rows
            const last = rows[rows.length - 1]

            if (value.endsWith('\n')) rows.push([])
            value = value.replace(/[,\n]$/, '')
            last.push(value.startsWith('"') ? value.replace(/""/g, '"').slice(1, -1) : value)
            return rows
        }, [[]])
}

module.exports.load = async function (filename) {
    return module.exports.parse(await fs.readFile(filename, 'utf8'))
}

module.exports.format = function (rows, delim = '\t') {
    return rows
        .map(row => row
            .map(value => ((value==null||!value.includes)&&console.error(value, row))|| /["\n]/.test(value) || value.includes(delim) ? escapeValue(value) : value)
            .join(delim)
        )
        .join('\n')
}

module.exports.write = async function (filename, rows) {
    return fs.writeFile(filename, module.exports.format(rows))
}
