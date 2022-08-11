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
                if (gbifId && gbifId in gbifIndex) {
                    gbifIndex[gbifId].push(taxon[0])
                } else if (gbifId) {
                    gbifIndex[gbifId] = [taxon[0]]
                }
                resource.taxonCount += 1
            }

            resources[resource.id] = resource
        }))
    }))

    await Promise.all([
        fs.writeFile(path.join(REPO_ROOT, 'gbif.index.json'), JSON.stringify(gbifIndex, null, 2)),
        fs.writeFile(path.join(REPO_ROOT, 'index.json'), JSON.stringify(resources, null, 2))
    ])
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
