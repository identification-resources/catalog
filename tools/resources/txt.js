const yaml = require('js-yaml')

const RANKS = [
    'class',
    'superorder',
    'order',
    'suborder',
    'infraorder',
    'superfamily',
    'family',
    'subfamily',
    'tribe',
    'subtribe',
    'genus',
    'subgenus',
    'group',
    'species',
    'subspecies',
    'variety',
    'form'
]

const DWC_RANKS = [
    'kingdom',
    'phylum',
    'class',
    'order',
    'family',
    'subfamily',
    'genus',
    'subgenus'
]

const TAXONOMIC_STATUS = {
    '>': 'incorrect',
    '+': 'heterotypic synonym',
    '=': 'synonym'
}

const INDET_SUFFIXES = new Set([
    'sp.',
    'spec.',
    'indet.',
    'sp. indet.',
    'spec. indet.'
])

const RANK_LABELS = {
    'subspecies': 'subsp.',
    'variety': 'var.',
    'form': 'f.'
}

const NAME_PATTERN = new RegExp(
    '^' +
        // $1 main name part
        '(\\S+)' +
        // $2 optional author citation
        '(?: ' +
            // but not auct(t).
            '(?!auctt?\.)' +
        '(' +
            // $2.1 anything in parentheses
            '\\(.+?\\)' +
        '|' +
            // $2.2 anything followed by a year
            '.+?\\d{4}\\)?' +
        '|' +
            // $2.3 name(, name)* & name
            '.+(?:, .+)* & \\S+' +
        '|' +
            // $2.4 name y name
            '\\S+ [yY] \\S+' +
        '|' +
            // $2.5 name( in name)
            '\\S+(?: in \\S+)?' +
        '))?' +
        // $3 optional notes
        '(?: (.+))?' +
    '$'
)

/**
 * Structure
 *   $1 genus+subgenus (+ trailing space): (?:([A-Z]\S+) (?:\(([A-Z]\S+?)\) )?)?
 *     $1.1 genus: ([A-Z]\S+)
 *     $1.2 subgenus: (?:\(([A-Z]\S+?)\) )?
 *   $2 species: ([a-z]\S+)
 */
const BINAME_PATTERN = /^(?:([A-Z]\S+) (?:\(([A-Z]\S+?)\) )?)?([a-z]\S+) ?/

const NAME_CLEAN_PATTERN = /\b[A-Z][a-z]?\.\b|, \d{4}/g

function compareRanks (a, b) {
    return RANKS.indexOf(a) - RANKS.indexOf(b)
}

function capitalize (name) {
    return name[0].toUpperCase() + name.slice(1).toLowerCase()
}

function isUpperCase (name) {
    return name === name.toUpperCase()
}

function capitalizeAuthors (authors) {
    return authors
        .replace(
            /[^\x00-\x40\x5B-\x60\x7B-\x7F]+/g,
            name => isUpperCase(name) ? capitalize(name) : name
        )
        .replace(/ Y /g, ' y ')
}

function parseName (name, rank, parent) {
    const item = {}
    // Parent context is used for parsing and formatting binomial names.
    const parentContext = { ...parent, incorrect: { ...parent.incorrect } }

    if (/^[+=>] /.test(name)) {
        const type = name[0]
        rank = parentContext.taxonRank
        name = name.replace(/^[+=>] (\? ?)?/, '')
        item.taxonomicStatus = TAXONOMIC_STATUS[type]
        const [, genus, subgenus, species] = name.match(BINAME_PATTERN) || []
        if (genus) {
            parentContext.genus = genus
            parentContext.incorrect.genus = genus
        }
        if (subgenus) {
            parentContext.subgenus = subgenus
            parentContext.incorrect.subgenus = subgenus
        } else if (genus) {
            // If a genus is given but no subgenus, remove it from the parent context
            delete parentContext.subgenus
            delete parentContext.incorrect.subgenus
        }
        if (species) {
            parentContext.specificEpithet = species
            parentContext.incorrect.specificEpithet = species
        }
    } else {
        item.taxonomicStatus = 'accepted'
    }

    if (compareRanks('subgenus', rank) < 0) {
        const parseContext = parentContext.incorrect || parentContext
        if (!parseContext.genus) { parseContext.genus = name.split(' ', 1)[0] }
        const genusPrefix = parseContext.genus[0] + parseContext.genus.slice(1).toLowerCase() + ' '

        if (name.startsWith(genusPrefix)) {
            name = name.slice(genusPrefix.length).replace(/^\(.*?\) /, '')
        }

        if (compareRanks('species', rank) < 0) {
            const speciesPrefix = parseContext.specificEpithet + ' '
            if (name.startsWith(speciesPrefix)) {
                name = name.slice(speciesPrefix.length).replace(/^(ssp\.|var\.|f\.) /, '')
            }
        }
    }

    const nameParts = name.match(NAME_PATTERN)
    if (!nameParts) {
        throw new Error(`Taxon "${name}" could not be parsed`)
    }
    const [_, taxon, citation = '', notes] = nameParts
    item.scientificNameAuthorship = capitalizeAuthors(citation)
    item.taxonRemarks = notes
    item.taxonRank = rank

    if (compareRanks('subgenus', rank) >= 0) {
        item.scientificName = capitalize(taxon)
        if (item.scientificName[0] !== taxon[0]) {
            throw new Error(`Taxon name (${rank}) should be capitalized: "${taxon}"`)
        }
    }

    if (rank === 'group') {
        item.genericName = parentContext.genus
        item.infragenericEpithet = parentContext.subgenus
        const specificEpithet = taxon.toLowerCase().replace(/(-group)?$/, '-group')
        item.scientificName = `${item.genericName} ${specificEpithet}`
        if (specificEpithet !== taxon) {
            console.log(item, taxon)
            throw new Error(`Group name should be lowercase: "${taxon}"`)
        }
    } else if (rank === 'species') {
        item.genericName = parentContext.genus
        item.infragenericEpithet = parentContext.subgenus
        item.specificEpithet = taxon.toLowerCase()
        item.scientificName = `${item.genericName} ${item.specificEpithet}`
        if (item.specificEpithet !== taxon) {
            console.log(item, taxon)
            throw new Error(`Specific epithet should be lowercase: "${taxon}"`)
        }
    } else if (compareRanks('species', rank) < 0) {
        item.genericName = parentContext.genus
        item.infragenericEpithet = parentContext.subgenus
        item.specificEpithet = parentContext.specificEpithet
        item.intraspecificEpithet = taxon.toLowerCase()
        const nameParts = [
            item.genericName,
            item.specificEpithet,
            item.intraspecificEpithet
        ]
        if (item.taxonRank in RANK_LABELS) {
            nameParts.splice(2, 0, RANK_LABELS[item.taxonRank])
        }
        item.scientificName = nameParts.join(' ')
        if (item.intraspecificEpithet !== taxon) {
            console.log(item, taxon)
            throw new Error(`Intraspecific epithet should be lowercase: "${taxon}"`)
        }
    }

    item.scientificNameOnly = item.scientificName
    if (item.scientificNameAuthorship) {
        item.scientificName += ` ${item.scientificNameAuthorship}`
    }

    if (item.taxonomicStatus === 'incorrect') {
        parent.incorrect = { ...parent }
        for (const key in item) {
            if (key !== 'taxonomicStatus') {
                parent[key] = item[key]
            }
        }
    }

    return item
}

function parseConfig (header) {
    const config = yaml.load(header)
    return {
        levels: [],
        scope: [],
        ...config
    }
}

function validateResource (content, config) {
    // Invalid configuration
    if (!Array.isArray(config.levels)) {
        throw new SyntaxError('"levels" should be an array')
    }
    if (!Array.isArray(config.scope)) {
        throw new SyntaxError('"scope" should be an array')
    }

    // No taxon ranks
    if (config.levels.length === 0) {
        throw new SyntaxError('Resource contains no taxa')
    }

    // Invalid taxon ranks
    const invalidTaxonRanks = config.levels.filter(rank => !RANKS.includes(rank))
    if (invalidTaxonRanks.length) {
        throw new SyntaxError(`"levels" contains invalid values: ${invalidTaxonRanks.join(', ')}`)
    }

    // Too much indentation
    const longerIndent = new RegExp(`^(  ){${config.levels.length - 1}}(?!  [+=>] ) `, 'm')
    if (longerIndent.test(content)) {
        const offset = content.match(longerIndent).index
        const line = (content.slice(0, offset).match(/\n/g) || []).length + 1
        throw new SyntaxError(`Too much indentation at ${line}:0
${content.slice(offset).split('\n', 1)}
^`)
    }
}

function parseResource (resource, workId, resourceIndex) {
    const idBase = `${workId}:${resourceIndex}:`
    const [header, content] = resource.split(/\n---\n+/)
    const config = parseConfig(header)

    validateResource(content, config)

    const data = {}
    let id = 0
    let parents = []
    let groupIndent = 0

    for (const line of content.trim().split('\n')) {
        const lineIndent = line.match(/^ */)[0].length

        if (lineIndent > groupIndent) {
            // Do not count synonyms as parents
            // (id here is still the parent id)
            if (data[idBase + id].taxonomicStatus === 'accepted') {
                parents.push(idBase + id)
            } else {
                parents.push(null)
            }
            // Handle skips in indentation levels,
            // e.g. if a certain genus has only species
            // whereas other genera in the same key also
            // have subgenera
            if ((lineIndent - groupIndent) > 2) {
                const gap = (lineIndent - groupIndent - 2) / 2
                for (let i = 0; i < gap; i++) { parents.push(null) }
            }
            groupIndent = lineIndent
        } else if (lineIndent < groupIndent) {
            parents = parents.slice(0, lineIndent / 2)
            groupIndent = lineIndent
        }

        const parentId = parents.reduce((parent, id) => id || parent, null)
        const parent = data[parentId] || {}

        const name = line.slice(groupIndent)
        const rank = config.levels[groupIndent / 2]
        const item = parseName(name, rank, parent)
        const isSynonym = item.taxonomicStatus !== 'accepted'
        const isIndet = Array.from(INDET_SUFFIXES).some(suffix => name.endsWith(' ' + suffix))

        if (item.taxonomicStatus === 'incorrect' || isIndet) {
            continue
        }

        item.scientificNameID = idBase + (++id).toString()
        item.parentNameUsageID = isSynonym ? '' : parent.scientificNameID || ''
        item.parentNameUsage = isSynonym ? '' : parent.scientificName || ''
        item.acceptedNameUsageID = isSynonym ? parent.scientificNameID : ''
        item.acceptedNameUsage = isSynonym ? parent.scientificName : ''
        item.collectionCode = idBase.slice(0, -1)

        for (const rank of DWC_RANKS) {
            item[rank] = ''
            if (parent[rank]) {
                item[rank] = parent[rank]
            }
            if (item.taxonRank === rank) {
                item[rank] = item.scientificNameOnly
            }
        }

        if (isSynonym) {
            item.higherClassification = parent.higherClassification
        } else if (parent.higherClassification) {
            item.higherClassification = parent.higherClassification + ` | ${parent.scientificNameOnly}`
        } else if (parentId) {
            item.higherClassification = parent.scientificNameOnly
        }

        data[item.scientificNameID] = item
    }

    return {
        id: `${workId}:${resourceIndex}`,
        file: `${workId}-${resourceIndex}`,
        workId,
        metadata: config,
        taxa: data
    }
}

function parseFile (file, id) {
    return file
        .split('\n\n===\n\n')
        .map((resource, index) => parseResource(resource, id, index + 1))
}

module.exports = parseFile
