// CareerChatbot.js (Frontend)
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NeonText } from "@/components/NeonText";
import { GlassCard } from "@/components/GlassCard";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const CareerChatbot = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([{
    id: 1,
    role: "bot",
    content: "Hi there! I'm your AI career assistant. How can I help you today?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const botResponse = await getAIResponse(input);
      const botMessage = {
        id: Date.now() + 1,
        role: "bot",
        content: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast({
        title: "Error",
        description: "There was an error fetching the AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const getAIResponse = async (userInput) => {
    try {
      // Send request to your backend server
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: userInput,
      });

      // Return the AI response
      return response.data.message;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      throw error;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[600px] flex flex-col"
      >
        <GlassCard className="flex-1 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
              <NeonText as="h2" className="text-xl">Career Support Assistant</NeonText>
            </CardTitle>
            <CardDescription>
              Ask questions about resumes, job applications, interviews, or career advice.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className={`h-8 w-8 ${message.role === "user" ? "ml-2" : "mr-2"}`}>
                      <AvatarFallback className={message.role === "user" ? "bg-purple-700" : "bg-blue-700"}>
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg px-4 py-2 ${message.role === "user" ? "bg-purple-500/30 border border-purple-500/20" : "bg-blue-500/30 border border-blue-500/20"}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="flex flex-row">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-blue-700">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-blue-500/30 border border-blue-500/20">
                      <p className="text-sm typing-animation">Typing...</p>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex w-full space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-background/40 border-purple-500/20"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CareerChatbot;
