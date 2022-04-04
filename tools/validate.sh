#!/usr/bin/env bash

cd "${0%/*}"

status=0

for file in ../*.csv; do
  echo "> $(basename $file .csv)";
  echo "";
  npx --yes @larsgw/loir-catalog-validator $file;
  status=$(( $status + $? ));
  echo "";
  echo "";
done

if [[ ${status} -gt 0 ]];
then
  exit 1;
fi;
