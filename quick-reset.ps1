Write-Host "=== QUICK RESET (Redis + Kafka Offsets) ==="

# 1. Flush Redis
Write-Host "1. Flushing Redis..."
docker exec ww-redis redis-cli FLUSHALL
Write-Host "   ✓ Redis flushed"

# 2. Reset Kafka consumer group offsets
Write-Host "2. Resetting Kafka consumer offsets to latest..."
docker exec ww-kafka kafka-consumer-groups.sh `
  --bootstrap-server localhost:9092 `
  --group gameplay-service `
  --reset-offsets `
  --to-latest `
  --all-topics `
  --execute
Write-Host "   ✓ Consumer offsets reset to latest"

# 3. Restart gameplay service
Write-Host "3. Restarting gameplay-service..."
docker-compose restart gameplay-service

Write-Host ""
Write-Host "=== RESET COMPLETE ==="
Write-Host "Old games stopped, consumer will only process NEW messages"