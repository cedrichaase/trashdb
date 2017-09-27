#!/bin/bash

ports="3000 3001 3002 3003 3004"

for port in $ports; do
  node dist/app.js --port $port --shard $port &
done

wait
