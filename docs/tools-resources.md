# Setup

  1. Install [Node.js](https://nodejs.org/en/).
  2. Install [gnverifier](https://github.com/gnames/gnverifier).

# Running

When running `loir-resources-process`, you are sometimes prompted for input.
Here are some instructions for this:

## Generating Darwin Core failed, retry?

Parsing the text file failed. The reason for this is printed above. The text file
can be fixed, after which you can press `Enter` on the prompt to retry and continue.

Common errors:
  - `"levels" should be an array`: check the YAML
  - `"scope" should be an array`: check the YAML
  - `Resource contains no taxa`: the `levels` array in the YAML is empty
  - `"levels" contains invalid values`: check the `levels` array in the YAML
  - `Too much indentation at {line}:0`
  - `Taxon name ({rank}) should be capitalized: "{taxon}"`
  - `{rank} should be lowercase: "{taxon}"` (can also indicate that the name was parsed wrong)

## Source results in short prefix

Sometimes while adding identifiers to the Darwin Core file, two genera with the same
name exist and the wrong one is returned. This often results in the two classification
paths having a short prefix, for example `Animalia` for the bird genus
_Cleptes_ Gambel, 1847 and the insect genus _Cleptes_ Latreille, 1802.

For Catalogue of Life results this happens a lot, and since the resulting identifiers
are not used anyway they are discarded automatically (`deleting...`). For GBIF results,
prompts like are presented:

    B123: source 11 results in short prefix "Animalia" (1 taxa)
      taxon: B123:1:1 "Cleptes"
      class: Animalia|Chordata|Aves
      prefx: Animalia|Arthropoda|Insecta|Chrysididae

Here, `taxon` is the identifier and the name of the taxon currently being resolved; `class`
is the classification of the result of the resolving; and `prefx` is the classification
of the rest of the file.

It then prompts

      Keep or delete (k/d)?

This is because for a key to trees including both pines and oaks already has a short
common classification prefix (`Plantae|Tracheophyta`) in which case the result may be
correct even though the prefix is short.

## Problems found. Skip or retry?

After this, the remaining results are checked for completeness. If some GBIF taxa are
missing they are listed and the following prompt is shown:

    B123: problems found in B123:1. Skip or retry (s/r)?

The two options:

  - "Skip" ignores the problem, prompts for the reason (`Reason for skipping?`) and
    appends this reason to a global CSV file so that the problem can be ignored
    automatically in the future.
  - "Retry" reloads the text file and starts parsing and resolving again.
