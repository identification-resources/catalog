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
options as well, of course).

## Future roadmap

Appart from collecting more data, the existing data should be put in a more structured form and
perhaps added to Wikidata or similar platforms, or at least cross-referenced with them.

As for the application, in cases where keys are available under open license, they can be
converted to a standard format and chained together in the interface. Additional improvements
to the (currently theoretical) identification interface will be researched.
