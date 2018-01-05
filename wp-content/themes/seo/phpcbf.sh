#!/usr/bin/env bash

PROJECT_ROOT=$(dirname $0)

TARGET=$@

PHPCBF_PATH=${PROJECT_ROOT}/vendor/bin/phpcbf

${PHPCBF_PATH} ${TARGET} --standard=./PHPCodeStandards.xml -q

PHPCBF_EXIT_CODE=$?

if [ ${PHPCBF_EXIT_CODE} == 3]; then
  exit 1
fi;
