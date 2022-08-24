# Catalog of Identification Resources

This repository holds a catalog of works containing identification resources, complete with
bibliographical metadata and metadata on the types of identification resources within the work,
the taxon/taxa they distinguish, the geographical region they apply to, and their intended
completeness. Here, “identification resources” are identification keys, multi-access (matrix)
keys, lists of species descriptions with or without explicit comparisons to similar species,
and any other tools that can aid in the identification of species.

> Works can also be added to help link between related works, for example by adding web pages
that collect identification keys on a certain topic (such as this project). Although the work
(i.e. the web page) does not itself assist in identification, it can be useful nonetheless, for
grouping works and if not all the works that are listed in the collection are already included
in this catalog. Another type of work that can be added to link related works are of a more
abstract type: when an author publishes a key to a single taxon in several bibliographical works,
it may be useful to include in this catalog an additional, abstract works consisting of those
several parts.

In addition to works, the **individual resources** within the work can also be modeled, with additional
bibliographic metadata (e.g. page numbers), a per-resource specification of the biological scope
of the resource (e.g. key only for females, or larvae, or terrestrial species), and a list of
the species (or genera, families; the leaf taxa) that can be distinguished with the individual
resource, optionally with their taxonomic classification. For example, in [a key to the Dutch
species of Pompilidae (Hymenoptera)](https://purl.org//identification-resources/resource/B501:1)
the species can be listed grouped by subgenus, genus and family, as well as with synonyms, as
long as this information is presented in the original work.

Some data is linked to other sources: authors, publishers, and places of works, as well as works
themselves, are linked to [Wikidata](https://wikidata.org/). The taxa are, when possible, linked
to [Catalogue of Life](https://www.catalogueoflife.org/) and [GBIF](https://www.gbif.org/).

## Interacting with the data

A simple interface to this data is being developed in
[a parallel Git repository](https://github.com/identification-resources/identification-resources.github.io),
and is available online at https://identification-resources.github.io/.

  - The catalog of works can be searched and browsed here:
    https://identification-resources.github.io/catalog
  - From there, individual works can be viewed in more detail, for example here:
    https://identification-resources.github.io/catalog/detail/?id=B501
  - From there, the individual resources within the work can be explored for example here:
    https://identification-resources.github.io/catalog/resource/?id=B501:1
  - A set of dynamic, interactive visualizations of the catalog can be viewed here:
    https://identification-resources.github.io/catalog/visualizations

In addition, a proof-of-concept application is also being developed in
[another Git repository](https://github.com/identification-resources/proof-of-concept).
This application is intended to select the right key for you (and gives you the other options as
well, of course), automatically. This is based on a known parent taxon and the location of
the observation. The results are then sorted on a number of heuristics, such as the
availability of full text, the recency and completeness of the work, and the specificity.

## Future roadmap

The entries in the catalog are mainly focused on Europe right now as I have been adding the keys
that I have been using (and related works), but content from elsewhere is very, very welcome
(see [contributing](#contributing)). Apart from collecting more data, I want to synchronize more
of the data to Wikidata or similar platforms, or at least link them better.

As for the application, in cases where keys are available under open license, they can be
converted to a standard format and chained together in the interface. Additional improvements
to the (currently theoretical) identification interface will be researched.

## Contributing

You are of course welcome to help improve the catalog. You can do this in a number of ways,
including

  1. [Suggesting new keys or other resources to add to the catalog.](https://github.com/identification-resources/catalog/issues/new?assignees=&labels=untriaged%2C+untriaged%3A+addition&template=addition-to-the-catalog.md&title=)
  2. [Reporting errors in the metadata of already added resources.](https://github.com/identification-resources/catalog/issues/new?assignees=&labels=untriaged%2C+untriaged%3A+error&template=catalog-error.md&title=)
  3. [Adding or improving resources yourself by editing the catalog file and making a pull request.](https://github.com/identification-resources/catalog/blob/main/CONTRIBUTING.md#adding-resources)
