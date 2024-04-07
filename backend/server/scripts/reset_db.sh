#!/bin/bash

for i in {1..10}; do
  sqlx migrate revert
done

sqlx migrate run
