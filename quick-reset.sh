#!/bin/bash

echo "=== QUICK RESET (Redis + Kafka Offsets) ==="

# 1. Flush Redis to remove all game states
echo "1. Flushing Redis..."
docker exec ww-redis redis-cli FLUSHALL
echo "   ✓ Redis flushed"

# 2. Reset Kafka consumer group to start from latest (ignore old messages)
echo "2. Resetting Kafka consumer offsets to latest..."
docker exec ww-kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --group gameplay-service \
  --reset-offsets \
  --to-latest \
  --all-topics \
  --execute

echo "   ✓ Consumer offsets reset to latest"

# 3. Restart gameplay service to pick up new offsets
echo "3. Restarting gameplay-service..."
docker-compose restart gameplay-service

echo ""
echo "=== RESET COMPLETE ==="
echo "Old games stopped, consumer will only process NEW messages"
