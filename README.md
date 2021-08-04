# Catalog of Identification Resources

This repository holds a catalog of identification resources, complete with bibliographical metadata
and metadata on the type of key, the taxon/taxa it distinguishes, the geographical region it applies
to, and the intended completeness.

## Limitations

Some info was collected but is as of yet missing from the repo: this includes further scope
limitations (keys only for larvae, only for females, only for aquatic species), a more specific
description of incompleteness in the taxonomy ("all species and genera of family X, except species
of genus Y") and keys separated across different bibliographical units.

In addition the data model has its limitations. The bibliographical info is constrained to a few
specific columns, entry types are not encoded, and the concept of editions, translations, different
versions, and the distinction between printed books and ebooks is not well represented. Furthermore,
all keys in a single work are treated as one, leading to problems with the completeness definition.

## Current intentions

Proof-of-concept of an application that selects the right key for you (and gives you the other
options as well, of course). The entries in the catalog are mainly focused on Europe right now, but
content for the US is welcome (see [contributing](#contributing)).

## Future roadmap

Appart from collecting more data, the existing data should be put in a more structured form and
perhaps added to Wikidata or similar platforms, or at least cross-referenced with them.

As for the application, in cases where keys are available under open license, they can be
converted to a standard format and chained together in the interface. Additional improvements
to the (currently theoretical) identification interface will be researched.

## Contributing

You are of course welcome to help improve the catalog. You can do this in a number of ways,
including

  1. [Suggesting new keys or other resources to add to the catalog.](https://github.com/identification-resources/catalog/issues/new?assignees=&labels=untriaged%2C+untriaged%3A+addition&template=addition-to-the-catalog.md&title=)
  2. [Reporting errors in the metadata of already added resources.](https://github.com/identification-resources/catalog/issues/new?assignees=&labels=untriaged%2C+untriaged%3A+error&template=catalog-error.md&title=)
  3. [Adding or improving resources yourself by editing the catalog file and making a pull request.](https://github.com/identification-resources/catalog/blob/main/CONTRIBUTING.md#adding-resources)
