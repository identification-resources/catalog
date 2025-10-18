# Contributing

You are of course welcome to help improve the catalog. You can do this in a number of ways,
including

  1. [Suggesting new keys or other works to add to the catalog.](https://github.com/identification-resources/catalog/issues/new?assignees=&labels=untriaged%2C+untriaged%3A+addition&template=addition-to-the-catalog.md&title=)
  2. [Reporting errors in the metadata of already added works.](https://github.com/identification-resources/catalog/issues/new?assignees=&labels=untriaged%2C+untriaged%3A+error&template=catalog-error.md&title=)
  3. [Adding or improving works yourself by editing the catalog file and making a pull request.](#adding-works)
  4. [Adding or improving resources within works](#adding-resources-within-works)

## Adding works

When adding new works, the following principles should be considered.

  - The entry should not already be in the registry, except if
    - it is a translation published separately from the original, i.e. not in the same article/book/webpage; or
    - it has a different edition number, version number, or ISBN (not counting ISBN-10/ISBN-13), even if the content is the same.
  - The entry should aid in the identification of an organism, by being
    - an identification key;
    - a multi-access key (matrix key);
    - a reference, listing one or more of: descriptions, distribution notes, images, differences to other species;
    - a gallery, listing images of several species in a group, if and only if it is recommended for identification;
    - a checklist, listing the (sub)species in a certain group and area;
    - a supplement, including supplemental info and corrections, of any entry in the catalog; and/or
    - a collection, listing and/or describing several such entries.
  - The entry has some sort of legitimacy, as there is no way to encode such information in the catalog yet.

Three pieces of information about the new entries are requested, one required and
two optional:

  - The metadata of the entry should be added to `catalog.csv`. [The format for this is described in a separate document](docs/catalog.md#catalog).
  - Optionally, any authors, publishers and places in that metadata can be linked
    to Wikidata in `authors.csv` ([docs](docs/catalog.md#authors)), `publishers.csv`
    ([docs](docs/catalog.md#publishers)), and `places.csv` ([docs](docs/catalog.md#places)).
  - Additionally, if possible a checklist in Darwin Core-format is appreciated
    in `checklists/ID.csv` where `ID` is the ID of the entry (`B###`).

## Adding resources within works

There are two layers of entities, works and resources. Works are listed in the catalog, resources are part of works and contain a list of taxa.
Sometimes, a single book clearly contains multiple resources, e.g. a list of short keys in a supplement, or a checklist and a less complete key.
Otherwise, when adding new resources within works, the following principles should be considered.

  - If a work contains e.g. a key to adults and a key to nymphs (or females/males, etc.) but the included species differs, include them
    as separate resources.
  - If a work contains a key of Family A to Genus B and C, a key to the species of Genus B, but **not** a key to the species of Genus C,
    include the key to genera and the key to species as separate resources.
  - If a work contains a key of Family A to Genus B and C, a key to the species of Genus B, and a key to the species of Genus C, those can be modeled as a single key to the species of Family A.
  - If a work contains multiple distinct bibliographical entries, consider whether to add them as new works (using [`part_of`](docs/catalog.md#catalog)).
    "Distinct bibliographical entry" is a gray area and depends to how they are refered to by their "parent" work.
    Decisive is the number of distinct entries: if that number gets too large, it is preferable to include them
    as resources regardless.

To do this, follow the following steps:

  1. Create a text+YAML file specifying the resources [according to this document](docs/resources-txt.md).
  2. Generate the [DwC file](docs/resources-dwc.md) by running `npx -p @larsgw/formica loir-resources-process ./resources` [following these instructions](docs/tools-resources.md#running).
  3. Update the indices by running `npx -p @larsgw/formica loir-resources-index ./resources`.

## Generating Linked Data

```
npx -p @larsgw/formica loir-generate-linked-data . -f 'turtle' > data.ttl
```
