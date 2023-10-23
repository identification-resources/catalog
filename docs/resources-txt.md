# File format

## Keys

Multiple checklists in the same file are delimited by three equal signs
(`===`) on its own line, surrounded by two empty lines.

Each key starts with a YAML frontmatter enclosed in three hyphens (`---`)
at the start and the end. The YAML contains information on the syntax of
the checklist. The following information is supported:

  - `levels`, an array specifying which indentation levels correspond to
    which taxon ranks.
  - `catalog`: override catalog data, for example:
    - `pages`, a string specifying on which pages the key is available
    - `fulltext_url`, a string specifying on which url the key is available
    - `key_type`, one of the catalog resource types
    - `scope`, one or more scopes restricting the usage of the checklist, e.g.
      only for larvae

## Taxa

Each taxon in the checklist can have a number of formats:

  - Name Author, 1900 notes?
  - Name Author notes?
  - Name Auth. notes?
  - Name notes?

If possible, abbreviations indicating that a taxon is new (i.e. "n. sp.", etc.)
should be replaced by the corresponding author citation. Parenthesis around the
author and year (or only the author when the year is omitted) should be included
where necessary. Notes are optional, and mainly used for synonyms or for
indicating sensu stricto vs sensu lato.

Generally, uppercase names are fine except that:

  - Taxons of rank species or below should start with a lowercase letter
    and should generally be entirely lowercase.
  - Taxons of rank subgenus and above should start with an uppercase letter,
    but can be entirely uppercase or just capitalized.

For binomial and trinomial names (i.e. species and lower taxon ranks) only
the last part of the name needs to be listed:

    Blatta Linnaeus
      orientalis Linnaeus

However, if it is included, it should not be abbreviated. If the checklist has
no genus entries the first part of the name (i.e. the genus name) should always
be included.

## Rank skips

If for example, a genus does not contain subgenera but only species, but the
indentation level for subgenus is still used (e.g. for a different part of
the checklist), the indentation level can be skipped. If, in a genus, only
some species are included in a subgenus and some directly in the parent genus,
the latter species should be listed immediately after the genus with the
appropriate level of indentation. The following example shows both behaviours.

    Mesoveliidae
      Mesovelia
          furcata (Mulsant & Rey)
    Gerridae
      Gerris
          thoracicus Schummel
          lateralis Schummel
          argentatus Schummel
          odontogaster (Zetterstedt)
          lacustris (L.)
        Limnoporus
          rufoscutellatus (Latreille)
        Aquarius
          paludum (Fabricius)
          najas (Degeer)

## Leaf taxa

All leaf taxa in the checklist should be of the lowest level in the "levels"
array, except if the lowest levels are a subtaxa (subgenera, subspecies, etc.)
or tribes, in which case the next-lowest level should be considered. If a
certain key keys out to species except for a certain family a leaf taxon
should be introduced at the indentation level of species with a name consisting
of the family name and one of

  - "indet."
  - "sp. indet."
  - "spec. indet."
  - "sp."
  - "spec."

## Synonyms

Apart from notes after taxon names, some notes can be listed more structurally.
Synonyms are listed on one indentation level further than the taxon they belong
to, and start with an equals sign and a space (`= `). If the first character
after that string is a question mark their status as a synonym is treated accordingly.

Heterotypic/subjective synonym can be indicated with a plus sign instead of an
equals sign (`+ `).

If the name as written does not match the accepted spelling of the name, either
because of different suffixes of the specific epithet, typoes, different spellings
of the author name or a different citation year, or any other reason, the correct
name should at the same level as a synonym and prefixed with a greater-than sign
and a space (`> `).
