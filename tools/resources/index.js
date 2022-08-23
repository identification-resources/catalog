const { promises: fs, existsSync } = require('fs')
const path = require('path')
const readline = require('readline')
const { spawn } = require('child_process')
const csv = require('../csv.js')

const REPO_ROOT = path.join(__dirname, '..', '..', 'resources')
const PROBLEMS_FILE = path.join(__dirname, 'problems.csv')

const DWC_FIELDS = [
    'scientificNameID',
    'scientificName',
    'scientificNameAuthorship',
    'genericName',
    'intragenericEpithet',
    'specificEpithet',
    'intraspecificEpithet',

    'taxonRank',
    'taxonRemarks',
    'collectionCode',

    'taxonomicStatus',
    'acceptedNameUsageID',
    'acceptedNameUsage',

    'parentNameUsageID',
    'parentNameUsage',
    'kingdom',
    'phylum',
    'class',
    'order',
    'family',
    'subfamily',
    'genus',
    'subgenus',
    'higherClassification',

    'colTaxonID',
    'gbifTaxonID'
]

const DISPLAY_FIELDS = [
    'scientificNameID',
    'taxonRank',
    'scientificName',
    'taxonomicStatus',
    'taxonRemarks',
    'colTaxonID',
    'gbifTaxonID'
]

const GBIF_RANKS = [
    'kingdom',
    'phyllum',
    'class',
    'order',
    'family',
    'genus',
    'species',
    'subspecies',
    'variety'
]

function formatCsv (data) {
    const table = [DWC_FIELDS]

    for (const row in data) {
        table.push(table[0].map(prop => data[row][prop] || ''))
    }

    return csv.format(table, ',')
}

function prompt (question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    return new Promise(resolve => {
        rl.question(question, (answer) => {
            rl.close()
            resolve(answer)
        })
    })
}

async function promptForAnswers (question, answers) {
    while (true) {
        const answer = (await prompt(question))[0]
        if (answers.includes(answer)) {
            return answer
        }
    }
}

function runGnverifier (names) {
    return new Promise((resolve, reject) => {
        const proc = spawn('gnverifier', ['-s', '1,11', '-M'])
        let stdout = ''
        let stderr = ''
        proc.stdout.on('data', data => { stdout += data })
        proc.stderr.pipe(process.stdout)
        proc.on('close', code => {
            if (code === 0 || code === '0') {
                resolve(stdout)
            } else {
                reject()
            }
        })
        proc.stdin.write(names)
        proc.stdin.end()
    })
}

function shouldBeSkipped (id) {
    return new Promise(resolve => {
        const proc = spawn('xsv', ['search', '-s', '2', `^${id}$`, PROBLEMS_FILE])
        let stdout = ''
        proc.stdout.on('data', data => { stdout += data })
        proc.on('close', code => {
            resolve(stdout.split('\n').length > 2)
        })
    })
}

async function getResources (id) {
    const file = await fs.readFile(path.join(REPO_ROOT, 'txt', id + '.txt'), 'utf-8')
    console.log(`${id}: generating Darwin Core`)
    try {
        const parseFile = require('./txt.js')
        return parseFile(file, id)
    } catch (error) {
        console.log(error)
        await prompt(`${id}: generating Darwin Core failed, retry? `)
        delete require.cache[require.resolve('./txt.js')]
        return getResources(id)
    }
}

async function matchNames (resource) {
    console.log(`${resource.workId}: matching ${resource.id}`)
    const taxa = {}
    const names = []
    for (const id in resource.taxa) {
        const name = resource.taxa[id].scientificName

        if (!taxa[name]) { taxa[name] = {} }
        taxa[name][id] = { ...resource.taxa[id] }

        names.push(name)
    }

    const result = await runGnverifier(names.join('\n'))
    const classifications = { '1': [], '11': [] }

    const [header, ...matches] = csv.parse(result)
    for (const match of matches) {
        const name = match[header.indexOf('ScientificName')]
        const source = match[header.indexOf('DataSourceId')]
        const id = match[header.indexOf('TaxonId')]
        const classification = match[header.indexOf('ClassificationPath')]

        for (const loirId in taxa[name]) {
            const taxon = taxa[name][loirId]
            if (source === '1' && !taxon.colTaxonID) {
                taxon.colTaxonID = id
                classifications[source].push([taxon, classification])
            }
            if (source === '11' && GBIF_RANKS.includes(taxon.taxonRank) && !taxon.gbifTaxonID) {
                taxon.gbifTaxonID = id
                classifications[source].push([taxon, classification])
            }
        }
    }

    const results = {
        ...resource,
        taxa: Object.fromEntries(Object.values(resource.taxa).map(taxon => [
            taxon.scientificNameID,
            taxa[taxon.scientificName][taxon.scientificNameID]
        ]))
    }

    return [results, classifications]
}

async function checkPrefix (resource, classifications, source) {
    const lists = classifications[source]
    if (!lists.length) { return }
    let prefix = lists[0][1].split('|')

    for (const [taxon, list] of lists.slice(1)) {
        const parts = list.split('|')
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] !== prefix[i] && i < 3) {
                let choice

                if (source === '1' || taxon.taxonomicStatus !== 'accepted') {
                    choice = 'd'
                } else {
                    console.log(`${resource.workId}: source ${source} results in short prefix "${prefix.slice(0, i).join('|')}" (${i} taxa)`)
                    console.log(`  taxon: ${taxon.scientificNameID} "${taxon.scientificName}"`)
                    console.log(`  class: ${parts.join('|')}`)
                    console.log(`  prefx: ${prefix.join('|')}`)

                    choice = await promptForAnswers(`  Keep or delete (k/d)? `, ['k', 'K', 'd', 'D'])
                }

                switch (choice) {
                    case 'k':
                    case 'K': {
                        console.log(`  keeping...`)
                        break
                    }

                    case 'd':
                    case 'D': {
                        console.log(`  deleting...`)
                        if (source === '1') {
                            delete taxon.colTaxonID
                        } else if (source === '11') {
                            delete taxon.gbifTaxonID
                        }
                        break
                    }
                }

                break
            }
        }
    }
}

function checkResults (resource) {
    let correct = true
    const missing = []

    for (const id in resource.taxa) {
        const taxon = resource.taxa[id]
        if (taxon.taxonomicStatus !== 'accepted') { continue }

        const missingCol = false // !taxon.colTaxonID
        const missingGbif = GBIF_RANKS.includes(taxon.taxonRank) && !taxon.gbifTaxonID

        if (missingCol || missingGbif) {
            correct = false
            missing.push(taxon)
        }
    }

    if (missing.length) {
        console.table(missing, DISPLAY_FIELDS)
    }

    return correct
}

async function getMatchedResources (id) {
    const parsed = await getResources(id)
    const resources = []
    for (const resource of parsed) {
        const [results, classifications] = await matchNames(resource)

        for (const source in classifications) {
            await checkPrefix(resource, classifications, source)
        }

        const skip = await shouldBeSkipped(resource.id)
        if (!skip) {

            const correct = checkResults(results, classifications)
            if (!correct) {
                const choice = await promptForAnswers(
                    `${resource.workId}: problems found in ${resource.id}. Skip or retry (s/r)? `,
                    ['s', 'S', 'r', 'R']
                )

                switch (choice) {
                    case 's':
                    case 'S': {
                        const reason = await prompt('Reason for skipping? ')
                        fs.appendFile(PROBLEMS_FILE, `${resource.workId},${resource.id},"${reason.replace(/"/g, '""')}"\n`)
                        console.log(`${resource.workId}: skipping ${resource.id}`)
                        break
                    }

                    case 'r':
                    case 'R': {
                        console.log(`${resource.workId}: retrying ${resource.id}`)
                        return getMatchedResources(id)
                    }
                }
            }
        }

        resources.push(results)
    }
    return resources
}

async function processWork (id) {
    const resources = await getMatchedResources(id)

    await Promise.all(resources.map((resource, index) => {
        return fs.writeFile(
            path.join(REPO_ROOT, 'dwc', `${resource.file}.csv`),
            formatCsv(Object.values(resource.taxa))
        )
    }))
}

async function main () {
    const input = await fs.readdir(path.join(REPO_ROOT, 'txt'))
    const output = await fs.readdir(path.join(REPO_ROOT, 'dwc'))
    const ids = input
        .map(file => path.basename(file, '.txt'))
        .sort((a, b) => a.slice(1) - b.slice(1))

    for (const id of ids) {
        if (output.some(file => file.startsWith(id))) {
            continue
        }
        await processWork(id)
    }
}

main().catch(error => {
    console.error(error)
    process.exit(1)
})

process.on('exit', () => {
    process.stdout.write('\n')
})
