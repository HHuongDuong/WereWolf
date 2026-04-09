# 🏗️ System Architecture

## 1. Overview
Microservices + Event-driven

## 2. Components
- API Gateway
- Auth Service
- Room Service
- Gameplay Service
- Vote Service
- Chat Service
- Profile Service
- Kafka
- Redis
- Postgres

## 3. Flow
Client → Gateway → Kafka → Services

## 4. Responsibilities

### Room Service
- Create room
- Join room
- Start game

### Gameplay Service
- Game state machine
- Handle skills

### Vote Service
- Collect votes
- Count results

### Chat Service
- Messaging (public/private)