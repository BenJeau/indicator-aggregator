#!/bin/bash

for i in {1..8}; do
  (cd ./database && sqlx migrate revert)
done

(cd ./database && sqlx migrate run)
