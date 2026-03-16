'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Send, LogOut, Bot, User as UserIcon, Loader2 } from 'lucide-react';

type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchChatHistory(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchChatHistory(session.user.id);
      } else {
        setMessages([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchChatHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chats:', error);
    } else if (data) {
      setMessages(data as Message[]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    let error;
    if (isLogin) {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    } else {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
    }

    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const newUserMsg: Message = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, newUserMsg]);

    // Save user message to Supabase
    await supabase.from('chats').insert({
      user_id: user.id,
      role: 'user',
      content: userMessage,
    });

    try {
      const apiMessages = [...messages, newUserMsg].map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsgContent = data.message || 'No response from AI.';
      
      const newAiMsg: Message = { role: 'assistant', content: aiMsgContent };
      setMessages((prev) => [...prev, newAiMsg]);

      // Save AI message to Supabase
      await supabase.from('chats').insert({
        user_id: user.id,
        role: 'assistant',
        content: aiMsgContent,
      });

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'An error occurred while communicating with the AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">AI Chatbot</h2>
            <p className="text-gray-500 mt-2">Sign in to start chatting</p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {authLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Bot size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Groq Assistant</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">{user.email}</div>
          <button 
            onClick={handleSignOut}
            className="text-gray-500 hover:text-red-500 transition-colors flex items-center space-x-1"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline text-sm font-medium">Log out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
            <div className="bg-gray-100 p-6 rounded-full">
              <Bot size={48} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">How can I help you today?</h3>
              <p className="max-w-md mx-auto text-sm">Send a message to start chatting with the Groq Llama 3 model.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 pb-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${msg.role === 'user' ? 'bg-blue-100 ml-4' : 'bg-emerald-100 mr-4'}`}>
                    {msg.role === 'user' ? <UserIcon size={20} className="text-blue-600" /> : <Bot size={20} className="text-emerald-600" />}
                  </div>
                  <div 
                    className={`px-5 py-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none prose prose-sm max-w-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                  <div className="flex max-w-[85%] sm:max-w-[75%] flex-row">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 mr-4">
                      <Bot size={20} className="text-emerald-600" />
                    </div>
                    <div className="px-5 py-4 rounded-2xl bg-white border border-gray-100 text-gray-800 rounded-tl-none flex items-center space-x-2">
                       <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                       <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                       <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={sendMessage} 
            className="flex items-center bg-gray-100 rounded-full p-1 sm:p-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-inner"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Groq Llama 3..." 
              className="flex-1 bg-transparent px-4 sm:px-6 py-2 sm:py-3 focus:outline-none text-gray-900 text-sm sm:text-base placeholder-gray-500 disabled:opacity-50"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 text-white p-2 sm:p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex-shrink-0 shadow-sm mr-1"
            >
              <Send size={20} className={input.trim() && !isLoading ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
            </button>
          </form>
          <div className="text-center text-xs text-gray-400 mt-3 font-medium">
            AI can make mistakes. Verify important information.
          </div>
        </div>
      </footer>
    </div>
  );
}
