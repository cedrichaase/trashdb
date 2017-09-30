#!/bin/bash

ports="3002 3003 3004 3005"

for port in $ports; do
  node dist/app.js --port $port --shard $port &
done

wait
