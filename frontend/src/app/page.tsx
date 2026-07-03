"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, UploadCloud, FileText, Trash2, Stethoscope, Loader2, HeartPulse, PlusCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const onDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadedFiles((prev) => [...prev, ...data.files_processed]);
      } else {
        alert("Upload failed: " + data.detail);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to the backend.");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/csv": [".csv"] },
  });

  const clearDatabase = async () => {
    if (!confirm("Delete all knowledge base documents?")) return;
    try {
      await fetch("http://localhost:8000/api/v1/clear", { method: "POST" });
      setUploadedFiles([]);
      setMessages([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const historyToSend = messages
        .filter(m => m.id !== "welcome" && m.id !== "cleared" && m.content.trim() !== "")
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: historyToSend
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let done = false;
      let streamedText = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          streamedText += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: streamedText } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: "**Connection Error:** Could not reach the local AI engine." } : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const springAnim = {
    type: "spring",
    stiffness: 400,
    damping: 30
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary font-sans">
      
      {/* Sidebar - Calming and Clean */}
      <div className="w-[280px] border-r border-border bg-card flex flex-col hidden md:flex shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="px-5 py-6 flex items-center gap-3 border-b border-border/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
            <Stethoscope className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-semibold tracking-tight text-[15px] leading-tight text-foreground">Health AI</h1>
            <p className="text-[11px] text-primary font-medium uppercase tracking-wider">Clinical Assistant</p>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-4 py-5">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Knowledge Base
              </h2>
              <PlusCircle className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
            </div>
            
            <div
              {...getRootProps()}
              className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 group ${
                isDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/40 hover:bg-primary/[0.02] bg-background/50"
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
              ) : (
                <div className="w-8 h-8 mx-auto rounded-full bg-primary/[0.06] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-4 h-4 text-primary group-hover:text-primary transition-colors" />
                </div>
              )}
              <p className="text-[13px] font-medium text-foreground/80">
                Drag SOPs or guidelines
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">PDF, CSV up to 50MB</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                Indexed Files
                <span className="bg-primary/10 text-primary font-bold text-[10px] py-0.5 px-1.5 rounded-full">{uploadedFiles.length}</span>
              </h2>
              {uploadedFiles.length > 0 && (
                <button onClick={clearDatabase} className="text-[11px] text-destructive hover:text-destructive/80 font-medium flex items-center gap-1 transition-colors">
                  Clear
                </button>
              )}
            </div>
            
            <div className="space-y-1.5">
              <AnimatePresence>
                {uploadedFiles.map((file, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    transition={springAnim}
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 bg-card hover:bg-background border border-border/60 rounded-lg group transition-colors shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[13px] truncate font-medium text-foreground/90">{file}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {uploadedFiles.length === 0 && (
              <div className="text-center mt-6 p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="text-[12px] text-muted-foreground">
                  Your knowledge base is empty. Upload documents to begin.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="max-w-3xl mx-auto px-6 pt-12 pb-32 space-y-10">
            
            {/* Empty State */}
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex flex-col items-center justify-center h-[50vh] text-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-6 border border-border/60">
                  <HeartPulse className="w-8 h-8 text-primary" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-3">How can I assist you today?</h2>
                <p className="text-[15px] text-muted-foreground max-w-md leading-relaxed">
                  I am connected to your local knowledge base. Upload your hospital's Standard Operating Procedures and ask me anything.
                </p>
              </motion.div>
            )}

            {/* Chat Messages */}
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springAnim}
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-white border border-border/60 flex items-center justify-center mr-4 shrink-0 shadow-sm mt-1">
                      <Stethoscope className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] text-[15px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-tr-sm shadow-md"
                        : "prose prose-slate prose-p:leading-relaxed prose-pre:bg-card prose-pre:border prose-pre:border-border max-w-none text-foreground pt-1.5"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="m-0 font-medium tracking-tight">{msg.content}</p>
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {isTyping && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 className="flex justify-start items-center"
               >
                 <div className="w-8 h-8 rounded-full bg-white border border-border/60 flex items-center justify-center mr-4 shrink-0 shadow-sm">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <div className="text-[13px] font-medium text-muted-foreground flex items-center tracking-wide">
                    Reviewing clinical documents...
                  </div>
               </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-12">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center group">
              <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a medical policy question..."
                className="w-full pl-6 pr-14 py-7 rounded-2xl border-border bg-white text-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-[15px] placeholder:text-muted-foreground/60 transition-all z-10"
                disabled={isTyping}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="absolute right-2.5 rounded-xl h-10 w-10 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100 z-20"
              >
                <Send className="w-4 h-4" strokeWidth={2.5} />
              </Button>
            </form>
            <div className="text-center mt-4 text-[11px] font-medium text-muted-foreground tracking-wide">
              Healthcare AI Assistant. Answers are strictly bounded by uploaded SOPs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
