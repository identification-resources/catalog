const { promises: fs, existsSync: fileExists } = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const REPO_ROOT = path.join(__dirname, '..', '..', 'resources')

function parseResource (resource) {
    const [header, content] = resource.split(/\n---\n+/)
    return {
        levels: [],
        scope: [],
        ...yaml.load(header)
    }
}

function parseResources (file) {
    return file.split('\n\n===\n\n').map(parseResource)
}

function numericSort (a, b) {
    const as = a.split(/(\d+)/)
    const bs = b.split(/(\d+)/)
    for (let i = 0; i < Math.max(as.length, bs.length); i++) {
        const ai = as[i]
        const bi = bs[i]

        if (ai === bi) {
            continue
        } else if (!ai) {
            return 1
        } else if (!bi) {
            return -1
        } else if (i % 2) {
            return ai - bi
        } else {
            return ai > bi ? -1 : 1
        }
    }
    return 0
}

function sortObject (object) {
    const sorted = {}
    for (const key of Object.keys(object).sort(numericSort)) {
        sorted[key] = object[key]
    }
    return sorted
}

async function main () {
    const files = await fs.readdir(path.join(REPO_ROOT, 'txt'))

    const gbifIndex = {}
    const resources = {}

    await Promise.all(files.map(async function (fileName) {
        if (!fileName.endsWith('.txt')) { return }
        const id = fileName.slice(0, -4)
        const file = await fs.readFile(path.join(REPO_ROOT, 'txt', fileName), 'utf-8')

        return Promise.all(parseResources(file).map(async function (resource, index) {
            resource.id = `${id}:${index + 1}`
            resource.taxonCount = 0

            const dwcFile = path.join(REPO_ROOT, 'dwc', `${id}-${index + 1}.csv`)
            if (!fileExists(dwcFile)) { return }
            const dwc = await fs.readFile(dwcFile, 'utf-8')
            for (const row of dwc.split('\n').slice(1)) {
                const taxon = [...row.matchAll(/([^,"]*|"(""|[^"])*")(,|$)/g)].map(match => match[1])
                const gbifId = taxon[25]
                if (gbifId) {
                    if (!(gbifId in gbifIndex)) {
                        gbifIndex[gbifId] = []
                    }
                    gbifIndex[gbifId].push(taxon[0])
                    gbifIndex[gbifId].sort(numericSort)
                }
                resource.taxonCount += 1
            }

            resources[resource.id] = resource
        }))
    }))

    await Promise.all([
        fs.writeFile(path.join(REPO_ROOT, 'gbif.index.json'), JSON.stringify(sortObject(gbifIndex), null, 2)),
        fs.writeFile(path.join(REPO_ROOT, 'index.json'), JSON.stringify(sortObject(resources), null, 2))
    ])
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
