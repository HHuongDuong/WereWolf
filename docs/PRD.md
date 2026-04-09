# 📌 Product Requirement Document (PRD)

## 1. Overview
- Product name: Werewolf Online
- Goal: Xây dựng game Ma Sói realtime multiplayer

## 2. Objectives
- Realtime gameplay (WebSocket)
- Hỗ trợ 6–12 players / room
- Low latency (<200ms)

## 3. User Flow
1. User login
2. Create / Join room
3. Start game
4. Play (Day/Night loop)
5. End game → result

## 4. Features
### 4.1 Core
- Room system
- Gameplay engine
- Voting system
- Chat system

### 4.2 Optional
- Ranking
- Match history

## 5. Non-functional Requirements
- Scalable (microservices)
- Fault tolerant
- Event-driven (Kafka)

## 6. Constraints
- Use Java (Spring Boot)
- Redis for realtime state
- Kafka for communication