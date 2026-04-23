#!/bin/bash

# Chat Service Test Script
# Usage: ./test-chat.sh

CHAT_URL="http://localhost:3003"
ROOM_ID="test-room-$(date +%s)"
GUEST_ID="guest_test$(date +%s)"

echo "==================================="
echo "Chat Service Test Script"
echo "==================================="
echo ""

# Test 1: Send message to global channel
echo "Test 1: Send message to global channel"
echo "---------------------------------------"
RESPONSE=$(curl -s -X POST "$CHAT_URL/chat/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"roomId\": \"$ROOM_ID\",
    \"channel\": \"all\",
    \"senderId\": \"$GUEST_ID\",
    \"senderName\": \"Test Player\",
    \"content\": \"Hello from global chat!\",
    \"round\": 1,
    \"phase\": \"day\"
  }")

echo "Response: $RESPONSE"
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ PASSED: Global chat message sent"
else
  echo "❌ FAILED: Global chat message failed"
fi
echo ""

# Test 2: Send message to wolves channel
echo "Test 2: Send message to wolves channel"
echo "---------------------------------------"
RESPONSE=$(curl -s -X POST "$CHAT_URL/chat/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"roomId\": \"$ROOM_ID\",
    \"channel\": \"wolves\",
    \"senderId\": \"$GUEST_ID\",
    \"senderName\": \"Test Wolf\",
    \"content\": \"Hello from wolf den!\",
    \"round\": 1,
    \"phase\": \"night\"
  }")

echo "Response: $RESPONSE"
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ PASSED: Wolves chat message sent"
else
  echo "❌ FAILED: Wolves chat message failed"
fi
echo ""

# Test 3: Send message that's too long
echo "Test 3: Send message that's too long (should fail)"
echo "---------------------------------------------------"
LONG_MESSAGE=$(printf 'A%.0s' {1..201})
RESPONSE=$(curl -s -X POST "$CHAT_URL/chat/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"roomId\": \"$ROOM_ID\",
    \"channel\": \"all\",
    \"senderId\": \"$GUEST_ID\",
    \"senderName\": \"Test Player\",
    \"content\": \"$LONG_MESSAGE\",
    \"round\": 1,
    \"phase\": \"day\"
  }")

echo "Response: $RESPONSE"
if echo "$RESPONSE" | grep -q '"success":false'; then
  echo "✅ PASSED: Long message rejected"
else
  echo "❌ FAILED: Long message should be rejected"
fi
echo ""

# Test 4: Send empty message
echo "Test 4: Send empty message (should fail)"
echo "-----------------------------------------"
RESPONSE=$(curl -s -X POST "$CHAT_URL/chat/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"roomId\": \"$ROOM_ID\",
    \"channel\": \"all\",
    \"senderId\": \"$GUEST_ID\",
    \"senderName\": \"Test Player\",
    \"content\": \"\",
    \"round\": 1,
    \"phase\": \"day\"
  }")

echo "Response: $RESPONSE"
if echo "$RESPONSE" | grep -q '"success":false'; then
  echo "✅ PASSED: Empty message rejected"
else
  echo "❌ FAILED: Empty message should be rejected"
fi
echo ""

echo "==================================="
echo "Test Summary"
echo "==================================="
echo "Room ID used: $ROOM_ID"
echo "Guest ID used: $GUEST_ID"
echo ""
echo "To check messages in database:"
echo "psql -h localhost -p 5436 -U werewolf -d werewolf -c \"SELECT * FROM messages WHERE \\\"roomId\\\" = '$ROOM_ID';\""
echo ""
echo "To check Redis state:"
echo "redis-cli GET chat_channel:$ROOM_ID:all"
echo "redis-cli GET chat_channel:$ROOM_ID:wolves"
