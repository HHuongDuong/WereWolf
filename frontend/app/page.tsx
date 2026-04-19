"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { socketManger } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Play, KeyRound } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const { myGuestId, roomStatus, setToast } = useGameStore();

  useEffect(() => {
    const savedName = localStorage.getItem("displayName");
    if (savedName) setDisplayName(savedName);
  }, []);

  // When room is created or joined successfully, WS sends ROOM_UPDATED -> roomStatus changes
  useEffect(() => {
    if (roomStatus === "waiting" || roomStatus === "in_game") {
      router.push("/lobby");
    }
  }, [roomStatus, router]);

  // Make sure we connect if not already connected (managed by GameProvider but just in case)
  useEffect(() => {
    socketManger.connect();
  }, []);

  const handleCreateRoom = () => {
    if (!displayName.trim()) {
      setToast("Vui lòng nhập tên của bạn!", "error");
      return;
    }
    localStorage.setItem("displayName", displayName);
    setIsCreating(true);
    
    // Fallback reset loading state after 5s if no response
    setTimeout(() => setIsCreating(false), 5000);
    
    socketManger.emit("CREATE_ROOM", {
      guestId: myGuestId,
      displayName: displayName.trim(),
    });
  };

  const handleJoinRoom = () => {
    if (!displayName.trim()) {
      setToast("Vui lòng nhập tên của bạn!", "error");
      return;
    }
    if (!roomCode.trim() || roomCode.length !== 6) {
      setToast("Mã phòng phải gồm 6 ký tự!", "error");
      return;
    }
    localStorage.setItem("displayName", displayName);
    setIsJoining(true);
    
    // Fallback reset loading state after 5s
    setTimeout(() => setIsJoining(false), 5000);
    
    socketManger.emit("JOIN_ROOM", {
      guestId: myGuestId,
      displayName: displayName.trim(),
      roomCode: roomCode.trim().toUpperCase(),
    });
  };

  return (
    <main 
      className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/valid_background.jpg')" }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(13,13,20,0.9)_100%)] pointer-events-none" />
      
      <div className="z-10 w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-text-muted drop-shadow-[0_0_15px_rgba(192,57,43,0.5)] tracking-wider">
            WEREWOLF
          </h1>
          <p className="text-wolf-red font-display tracking-[0.2em] font-medium opacity-90 uppercase">
            Blood & Betrayal
          </p>
        </div>

        <Card className="relative border-wolf-red/40 shadow-2xl shadow-black/80 backdrop-blur-md bg-bg-card/98 overflow-hidden">
          {/* Animated fire border effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 rounded-lg animate-pulse" 
                 style={{
                   boxShadow: '0 0 20px rgba(192,57,43,0.4), inset 0 0 20px rgba(192,57,43,0.2)',
                 }} 
            />
            <div className="absolute inset-0 rounded-lg animate-[pulse_2s_ease-in-out_infinite]" 
                 style={{
                   boxShadow: '0 0 30px rgba(255,87,51,0.3), inset 0 0 15px rgba(255,87,51,0.15)',
                   animationDelay: '0.5s'
                 }} 
            />
            <div className="absolute inset-0 rounded-lg animate-[pulse_1.5s_ease-in-out_infinite]" 
                 style={{
                   boxShadow: '0 0 25px rgba(255,140,0,0.25)',
                   animationDelay: '1s'
                 }} 
            />
          </div>
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-center text-2xl font-display tracking-wide">
              <span className="inline-block bg-gradient-to-r from-wolf-red via-red-400 to-wolf-red bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(192,57,43,0.4)]">
                Sảnh Chờ
              </span>
            </CardTitle>
            <CardDescription className="text-center text-base">
              <span className="inline-flex items-center gap-2 text-text-secondary/90">
                <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-wolf-red/30"></span>
                Nhập tên của bạn để bắt đầu
                <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-wolf-red/30"></span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Tên hiển thị
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input 
                  placeholder="Ví dụ: Lão Trưởng Thôn"
                  className="pl-9 bg-bg-base/50"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-bg-elevated/50 grid grid-cols-1 gap-4">
              <Button 
                variant="danger" 
                size="lg" 
                onClick={handleCreateRoom}
                isLoading={isCreating}
                disabled={isJoining}
                className="w-full flex items-center justify-center gap-2"
              >
                {!isCreating && <Play className="h-5 w-5 fill-current" />}
                Tạo Phòng Mới
              </Button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-bg-elevated/50"></div>
                <span className="flex-shrink-0 mx-4 text-text-muted text-xs uppercase tracking-widest">Hoặc</span>
                <div className="flex-grow border-t border-bg-elevated/50"></div>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input 
                    placeholder="Mã phòng (6 ký tự)"
                    className="pl-9 font-mono uppercase bg-bg-base/50 h-10"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <Button 
                  variant="default" 
                  onClick={handleJoinRoom}
                  isLoading={isJoining}
                  disabled={isCreating || !roomCode.trim()}
                  className="px-6"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Tham Gia
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
